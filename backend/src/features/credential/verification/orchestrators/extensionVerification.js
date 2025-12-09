import { normalizeInput } from '../pipeline/01_inputNormalizer.js';
import { validateDomain } from '../pipeline/02_domainValidator.js';
import { extractCertificateFromExtension } from '../pipeline/03_certificateExtractor.js';
import { extractText, extractTextFromBase64Image } from '../pipeline/04_ocrExtractor.js';
import { interpretText, validateMetadata } from '../pipeline/05_llmInterpreter.js';
import { matchName } from '../pipeline/06_nameMatcher.js';
import { calculateScore } from '../pipeline/07_scoreCalculator.js';
import { uploadAndSaveCredential } from '../pipeline/08_credentialSaver.js';
import { validateCourseLink, detectPlatform } from '../pipeline/09_courseLinkValidator.js';
import { scrapeCourse } from '../pipeline/10_courseScraper.js';
import { analyzeCourse } from '../pipeline/11_courseAnalyzer.js';
import { calculateNcrfNsqf } from '../pipeline/12_ncrfNsqfCalculator.js';
import User from '../../../user/user.model.js';

/**
 * Main orchestrator for extension-based verification
 *
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.imageData - Base64 encoded screenshot
 * @param {string} params.sourceUrl - Certificate page URL
 * @param {string} params.extractedText - (Optional) Pre-extracted text from extension
 * @param {string} params.courseUrl - (Optional) Course URL for NCrF/NSQF analysis
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
    courseUrl,
    autoSave = true,
    testMode = false,
    testUserName,
  } = params;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔵 [EXTENSION-VERIFICATION] Starting verification workflow`);
  console.log(`${'='.repeat(60)}`);
  console.log(`🔵 [EXTENSION-VERIFICATION] Parameters received:`);
  console.log(`   - userId: ${userId}`);
  console.log(`   - sourceUrl: ${sourceUrl}`);
  console.log(`   - courseUrl: ${courseUrl || 'NOT PROVIDED'}`);
  console.log(`   - autoSave: ${autoSave}`);
  console.log(`   - testMode: ${testMode}`);
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

    // STAGE 6.5: Validate microcredential duration
    console.log(`📍 STAGE 6.5: Validating microcredential duration...`);

    if (extractedData.learningHours !== null && extractedData.learningHours !== undefined) {
      if (extractedData.learningHours < 7.5 || extractedData.learningHours > 30) {
        console.error(`❌ Duration validation failed: ${extractedData.learningHours} hours (must be 7.5-30)\n`);
        throw new Error(
          `This certificate does not qualify as a microcredential. ` +
          `Microcredentials must have a duration between 7.5 and 30 hours. ` +
          `This certificate has ${extractedData.learningHours} hours.`
        );
      }
      console.log(`✅ Duration validated: ${extractedData.learningHours} hours (within 7.5-30 range)\n`);
    } else {
      console.warn(`⚠️ No learning hours extracted - skipping duration validation\n`);
    }

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

    // STAGES 10-12: Course Analysis (if courseUrl provided)
    let courseAnalysis = null;

    if (courseUrl) {
      console.log(`📍 STAGE 10: Validating course link...`);

      const courseLinkValidation = validateCourseLink(courseUrl);

      if (courseLinkValidation.isValid) {
        console.log(`✅ Course link is valid: ${courseLinkValidation.domain}\n`);

        try {
          // STAGE 10: Scrape course data
          console.log(`📍 STAGE 10: Scraping course data...`);

          const platform = detectPlatform(courseUrl);
          if (platform) {
            console.log(`   Detected platform: ${platform}`);
          }

          const scrapeResult = await scrapeCourse({
            courseUrl: courseLinkValidation.url,
            platform: platform || courseLinkValidation.domain,
          });

          if (scrapeResult.success && scrapeResult.courseData) {
            console.log(`✅ Course data scraped successfully\n`);

            // STAGE 11: Analyze and categorize course
            console.log(`📍 STAGE 11: Analyzing course content...`);

            const analysisResult = await analyzeCourse(scrapeResult.courseData);

            if (analysisResult.success) {
              console.log(`✅ Course analysis complete\n`);

              // STAGE 12: Calculate NCrF credits and NSQF level
              console.log(`📍 STAGE 12: Calculating NCrF credits and NSQF level...`);

              const calculationResult = await calculateNcrfNsqf(scrapeResult.courseData);

              console.log(`✅ NCrF/NSQF calculations complete\n`);

              courseAnalysis = {
                courseUrl,
                platform: scrapeResult.platform,
                scrapedData: scrapeResult.courseData,
                category: analysisResult.category,
                categoryConfidence: analysisResult.confidence,
                categoryReasoning: analysisResult.reasoning,
                ncrf: calculationResult.ncrf,
                nsqf: calculationResult.nsqf,
              };
            }
          }
        } catch (error) {
          console.warn(`⚠️  Course analysis failed: ${error.message}`);
          // Continue with verification even if course analysis fails
        }
      } else {
        console.warn(`⚠️  Invalid course URL: ${courseLinkValidation.reason}\n`);
      }
    }

    // STAGE 9: Save credential (if auto-save enabled and verified)
    let savedCredential = null;

    if (autoSave && verification.status === 'VERIFIED' && !testMode) {
      console.log(`📍 STAGE 9: Saving verified credential...`);

      // Don't catch errors here - let them propagate up to stop the pipeline
      savedCredential = await uploadAndSaveCredential({
        userId,
        imageBuffer: certificateImage,
        verificationData: {
          verificationUrl,
          domainValidation,
          extractedData,
          nameValidation,
          verification,
          courseAnalysis,
        },
        user,
      });

      console.log(`✅ Credential saved with ID: ${savedCredential._id}\n`);
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
      courseAnalysis, // Include course analysis if available
      ocrText, // For debugging
    };

  } catch (error) {
    console.error(`\n❌ [EXTENSION-VERIFICATION] Workflow failed:`, error.message);
    console.error(error.stack);

    throw error;
  }
}
