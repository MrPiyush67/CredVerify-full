import { normalizeInput } from '../pipeline/inputNormalizer.js';
import { validateDomain } from '../pipeline/domainValidator.js';
import { extractCertificateFromExtension } from '../pipeline/certificateExtractor.js';
import { extractText, extractTextFromBase64Image } from '../pipeline/ocrExtractor.js';
import { interpretText, validateMetadata } from '../pipeline/llmInterpreter.js';
import { matchName } from '../pipeline/nameMatcher.js';
import { calculateScore } from '../pipeline/scoreCalculator.js';
import { uploadAndSaveCredential } from '../pipeline/credentialSaver.js';
import User from '../../../user/user.model.js';

/**
 * Main orchestrator for extension-based verification
 * 
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.imageData - Base64 encoded screenshot
 * @param {string} params.sourceUrl - Certificate page URL
 * @param {string} params.extractedText - (Optional) Pre-extracted text from extension
 * @param {boolean} params.autoSave - Whether to auto-save if verified
 * @param {boolean} params.testMode - Test mode flag
 * @param {string} params.testUserName - Test user name (for test mode)
 * @returns {Promise<Object>} - Complete verification result
 */
export async function verifyFromExtension(params) {
  const {
    userId,
    imageData,
    sourceUrl,
    extractedText,
    autoSave = true,
    testMode = false,
    testUserName,
  } = params;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔵 [EXTENSION-VERIFICATION] Starting verification workflow`);
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
        throw new Error('User not found');
      }
      legalName = user.name;
    }

    console.log(`✅ Legal name: ${legalName}\n`);

    // STAGE 2: Normalize input to verification URL
    console.log(`📍 STAGE 2: Normalizing input...`);

    const normalizedInput = await normalizeInput({
      type: 'extension',
      data: { sourceUrl, imageData, extractedText },
    });

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

    // STAGE 4: Extract certificate image (already provided by extension)
    console.log(`📍 STAGE 4: Processing extension screenshot...`);

    const candidates = await extractCertificateFromExtension({ imageData });
    const certificateImage = candidates[0].image; // Extension provides single screenshot

    console.log(`✅ Certificate image ready (${certificateImage.length} bytes)\n`);

    // STAGE 5: OCR text extraction
    console.log(`📍 STAGE 5: Extracting text via OCR...`);

    let ocrText;

    if (extractedText && extractedText.length > 50) {
      // Use pre-extracted text from extension
      console.log(`   Using pre-extracted text from extension (${extractedText.length} chars)`);
      ocrText = extractedText;
    } else {
      // Run OCR on screenshot
      const ocrResult = await extractTextFromBase64Image(imageData);
      ocrText = ocrResult.text;
    }

    if (!ocrText || ocrText.length < 50) {
      throw new Error('OCR failed to extract sufficient text from certificate');
    }

    console.log(`✅ Extracted ${ocrText.length} characters\n`);

    // STAGE 6: LLM interpretation
    console.log(`📍 STAGE 6: Interpreting text with LLM...`);

    const extractedData = await interpretText(ocrText);
    const metadataValid = validateMetadata(extractedData);

    console.log(`✅ Extracted recipient: ${extractedData.recipientName || 'Not found'}`);
    console.log(`✅ Metadata valid: ${metadataValid}\n`);

    // STAGE 7: Name matching
    console.log(`📍 STAGE 7: Matching name with user profile...`);

    const nameValidation = matchName({
      extractedName: extractedData.recipientName,
      legalName,
      ocrText,
    });

    console.log(`✅ Name match: ${nameValidation.confidence}% - ${nameValidation.reason}\n`);

    // STAGE 8: Calculate verification score
    console.log(`📍 STAGE 8: Calculating verification score...`);

    const verification = calculateScore({
      nameConfidence: nameValidation.confidence,
      domainConfidence: domainValidation.confidence,
      metadataValid,
    });

    console.log(`✅ Final score: ${verification.finalScore}%`);
    console.log(`✅ Status: ${verification.status}\n`);

    // STAGE 9: Save credential (if auto-save enabled and verified)
    let savedCredential = null;

    if (autoSave && verification.status === 'VERIFIED' && !testMode) {
      console.log(`📍 STAGE 9: Saving verified credential...`);

      try {
        savedCredential = await uploadAndSaveCredential({
          userId,
          imageBuffer: certificateImage,
          verificationData: {
            verificationUrl,
            domainValidation,
            extractedData,
            nameValidation,
            verification,
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
    console.log(`✅ [EXTENSION-VERIFICATION] Workflow completed successfully`);
    console.log(`${'='.repeat(60)}\n`);

    return {
      success: true,
      verificationUrl,
      domainValidation,
      extractedData,
      nameValidation,
      verification,
      credential: savedCredential,
      ocrText, // For debugging
    };

  } catch (error) {
    console.error(`\n❌ [EXTENSION-VERIFICATION] Workflow failed:`, error.message);
    console.error(error.stack);

    throw error;
  }
}
