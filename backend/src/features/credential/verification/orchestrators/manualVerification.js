import { normalizeInput } from '../pipeline/01_inputNormalizer.js';
import { validateDomain } from '../pipeline/02_domainValidator.js';
import { extractCertificateImagesFromPage } from '../pipeline/03_certificateExtractor.js';
import { extractText, filterOcrCandidates } from '../pipeline/04_ocrExtractor.js';
import { interpretText, validateMetadata } from '../pipeline/05_llmInterpreter.js';
import { matchName } from '../pipeline/06_nameMatcher.js';
import { calculateScore } from '../pipeline/07_scoreCalculator.js';
import { uploadAndSaveCredential } from '../pipeline/08_credentialSaver.js';
import { scrapeCertificate } from '../../services/manualVerification.service.js';
import User from '../../../user/user.model.js';

/**
 * Main orchestrator for manual verification (link or QR code)
 * 
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.link - Direct verification URL (optional)
 * @param {Buffer} params.certificateImage - Image buffer with QR code (optional)
 * @param {boolean} params.autoSave - Whether to auto-save if verified
 * @param {boolean} params.testMode - Test mode flag
 * @param {string} params.testUserName - Test user name (for test mode)
 * @returns {Promise<Object>} - Complete verification result
 */
export async function verifyFromManualInput(params) {
  const {
    userId,
    link,
    certificateImage,
    autoSave = true,
    testMode = false,
    testUserName,
  } = params;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🟢 [MANUAL-VERIFICATION] Starting verification workflow`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // STAGE 1: Get user's legal name
    console.log(`📍 STAGE 1: Fetching user legal name...`);

    let legalName;
    let user = null;

    if (testMode) {
      legalName = testUserName || 'Test User';
      console.log(`[TEST MODE] Using test name: ${legalName}`);
    } else {
      user = await User.findById(userId).select('name email');
      if (!user) {
        console.error(`❌ [STAGE 1] User not found for ID: ${userId}`);
        throw new Error(`User not found: ${userId}`);
      }

      legalName = user.name;
      console.log(`✅ [STAGE 1] Found user: ${user.name} (${user.email})`);
      console.log(`   User ID: ${userId}`);
      console.log(`   Legal name: ${legalName}`);
    }

    console.log(`✅ Legal name: ${legalName}\n`);

    // STAGE 2: Normalize input to verification URL
    console.log(`📍 STAGE 2: Normalizing input to verification URL...`);

    let normalizedInput;

    if (certificateImage) {
      // QR code extraction
      normalizedInput = await normalizeInput({
        type: 'qr',
        data: certificateImage,
      });
    } else if (link) {
      // Direct link
      normalizedInput = await normalizeInput({
        type: 'link',
        data: link,
      });
    } else {
      throw new Error('Either link or certificateImage must be provided');
    }

    const verificationUrl = normalizedInput.verificationUrl;
    console.log(`✅ Verification URL: ${verificationUrl}\n`);

    // STAGE 3: Validate domain
    console.log(`📍 STAGE 3: Validating domain...`);

    const domainValidation = validateDomain(verificationUrl);

    if (!domainValidation.isTrusted) {
      console.warn(`❌ Domain validation failed: ${domainValidation.reason}\n`);

      return {
        success: false,
        error: 'UNTRUSTED_DOMAIN',
        message: domainValidation.reason,
        verificationUrl,
        domainValidation,
      };
    }

    console.log(`✅ Trusted issuer: ${domainValidation.issuer.name}\n`);

    // STAGE 4: Scrape certificate page
    console.log(`📍 STAGE 4: Scraping certificate page...`);

    const scrapedData = await scrapeCertificate(verificationUrl);

    console.log(`✅ Page scraped successfully`);
    console.log(`   Screenshot: ${scrapedData.screenshot ? scrapedData.screenshot.length + ' bytes' : 'null (pending implementation)'}`);
    console.log(`   Text: ${scrapedData.text ? scrapedData.text.length + ' characters' : 'null (pending implementation)'}\n`);

    // STAGE 5: Extract certificate images from page
    console.log(`📍 STAGE 5: Extracting certificate images...`);

    const imageCandidates = await extractCertificateImagesFromPage({
      screenshot: scrapedData.screenshot,
      text: scrapedData.text,
      url: verificationUrl,
    });

    console.log(`✅ Found ${imageCandidates.length} candidate image URL(s)`);

    // Debug: Log the structure of candidates
    if (imageCandidates.length > 0) {
      console.log(`📋 First candidate structure:`, JSON.stringify(imageCandidates[0], null, 2));
    }

    // STAGE 6: Download images and run OCR on each candidate
    console.log(`📍 STAGE 6: Downloading images and running OCR...`);

    const ocrCandidates = [];

    for (let i = 0; i < imageCandidates.length; i++) {
      const candidate = imageCandidates[i];

      console.log(`   Processing candidate ${i + 1}/${imageCandidates.length}: ${candidate.imageUrl}`);

      try {
        // Fetch image from URL
        const response = await fetch(candidate.imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);

        // Run OCR
        const ocrResult = await extractText(imageBuffer);

        ocrCandidates.push({
          image: imageBuffer,
          imageUrl: candidate.imageUrl,
          source: candidate.source,
          ocrResult,
          metadata: candidate.metadata,
          textLength: ocrResult.text.length, // Track text length for comparison
        });

        console.log(`   ✅ OCR extracted ${ocrResult.text.length} characters`);
      } catch (error) {
        console.warn(`   ⚠️  Failed to process candidate ${i + 1}:`, error.message);
      }
    }

    if (ocrCandidates.length === 0) {
      throw new Error('No images could be processed - all downloads or OCR failed');
    }

    // If multiple candidates, select the one with longest OCR text
    let bestCandidate;
    if (ocrCandidates.length > 1) {
      console.log(`\n📊 Comparing OCR text lengths...`);
      ocrCandidates.forEach((c, i) => {
        console.log(`   Candidate ${i + 1}: ${c.textLength} characters`);
      });

      // Sort by text length descending and pick the first
      ocrCandidates.sort((a, b) => b.textLength - a.textLength);
      bestCandidate = ocrCandidates[0];

      console.log(`✅ Selected candidate with ${bestCandidate.textLength} characters\n`);
    } else {
      bestCandidate = ocrCandidates[0];
    }

    // Filter candidates by OCR quality using existing function
    const validCandidates = filterOcrCandidates([bestCandidate]);

    if (validCandidates.length === 0) {
      throw new Error('Selected certificate image failed OCR quality filter');
    }

    console.log(`✅ OCR quality check passed\n`);

    // STAGE 7: LLM interpretation on each candidate
    console.log(`📍 STAGE 7: Interpreting extracted text with LLM...`);

    const interpretedCandidates = [];

    for (let i = 0; i < validCandidates.length; i++) {
      const candidate = validCandidates[i];

      console.log(`   Interpreting candidate ${i + 1}/${validCandidates.length}...`);

      try {
        const extractedData = await interpretText(candidate.ocrResult.text);
        const metadataValid = validateMetadata(extractedData);

        interpretedCandidates.push({
          ...candidate,
          extractedData,
          metadataValid,
        });
      } catch (error) {
        console.warn(`   ⚠️  LLM failed for candidate ${i + 1}:`, error.message);
      }
    }

    if (interpretedCandidates.length === 0) {
      throw new Error('LLM failed to extract metadata from any candidate');
    }

    console.log(`✅ Successfully interpreted ${interpretedCandidates.length} candidate(s)\n`);

    // STAGE 8: Name matching for each candidate
    console.log(`📍 STAGE 8: Matching names with user profile...`);

    const matchedCandidates = interpretedCandidates.map((candidate, i) => {
      console.log(`   Matching candidate ${i + 1}...`);

      const nameValidation = matchName({
        extractedName: candidate.extractedData.recipientName,
        legalName,
        ocrText: candidate.ocrResult.text,
      });

      return {
        ...candidate,
        nameValidation,
      };
    });

    console.log(`✅ Name matching complete\n`);

    // STAGE 9: Calculate verification score
    console.log(`📍 STAGE 9: Calculating verification score...`);

    // Get the matched candidate (should only be one since we selected bestCandidate earlier)
    const matchedCandidate = matchedCandidates[0];

    const verification = calculateScore({
      nameConfidence: matchedCandidate.nameValidation.confidence,
      domainConfidence: domainValidation.confidence,
      metadataValid: matchedCandidate.metadataValid,
    });

    console.log(`   Score: ${verification.finalScore}%, Status: ${verification.status}\n`);

    const finalCandidate = {
      ...matchedCandidate,
      verification,
    };

    // STAGE 10: Save credential (if auto-save enabled and verified)
    let savedCredential = null;

    if (autoSave && finalCandidate.verification.status === 'VERIFIED' && !testMode) {
      console.log(`📍 STAGE 10: Saving verified credential...`);

      try {
        savedCredential = await uploadAndSaveCredential({
          userId,
          imageBuffer: finalCandidate.image,
          verificationData: {
            verificationUrl,
            domainValidation,
            extractedData: finalCandidate.extractedData,
            nameValidation: finalCandidate.nameValidation,
            verification: finalCandidate.verification,
          },
          user,
        });

        console.log(`✅ Credential saved with ID: ${savedCredential._id}\n`);
      } catch (saveError) {
        console.error(`⚠️  Failed to save credential:`, saveError.message);

        // If it's a duplicate certificate error, throw it to be handled by the controller
        if (saveError.message === 'DUPLICATE_CERTIFICATE') {
          throw saveError;
        }

        // For other errors, continue - return verification result even if save failed
      }
    }

    // Return complete result
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ [MANUAL-VERIFICATION] Workflow completed successfully`);
    console.log(`${'='.repeat(60)}\n`);

    return {
      success: true,
      verificationUrl,
      domainValidation,
      extractedData: finalCandidate.extractedData,
      nameValidation: finalCandidate.nameValidation,
      verification: finalCandidate.verification,
      credential: savedCredential,
      ocrText: finalCandidate.ocrResult.text, // For debugging
      screenshot: finalCandidate.image, // Return the best certificate image
    };

  } catch (error) {
    console.error(`\n❌ [MANUAL-VERIFICATION] Workflow failed:`, error.message);
    console.error(error.stack);

    throw error;
  }
}
