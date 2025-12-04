import { extractCertificateMetadata } from '../../services/llm.service.js';

/**
 * Interpret OCR text and extract structured certificate data
 * 
 * @param {string} ocrText - Raw OCR text from certificate
 * @returns {Promise<Object>} - Structured certificate data
 * 
 * @example
 * const result = await interpretText(ocrText);
 * // Returns: {
 * //   recipientName: "John Smith",
 * //   courseTitle: "Machine Learning",
 * //   issueDate: "2024-01-15",
 * //   ...
 * // }
 */
export async function interpretText(ocrText) {
  console.log(`🤖 [LLM-INTERPRETER] Starting LLM interpretation...`);
  console.log(`📝 [LLM-INTERPRETER] OCR text length: ${ocrText.length} characters`);

  try {
    const metadata = await extractCertificateMetadata(ocrText);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ [LLM-INTERPRETER] Successfully extracted metadata`);
    console.log(`${'='.repeat(60)}`);
    console.log(`👤 Recipient Name: ${metadata.recipientName || '❌ NOT FOUND'}`);
    console.log(`📚 Course Title:   ${metadata.courseTitle || '❌ NOT FOUND'}`);
    console.log(`📅 Issue Date:     ${metadata.issueDate || 'Not found'}`);
    console.log(`⏱️  Duration:       ${metadata.duration || 'Not found'}`);
    console.log(`🎯 Skills:         ${metadata.skills?.length ? metadata.skills.join(', ') : 'Not found'}`);
    console.log(`${'='.repeat(60)}\n`);

    // Validate that we at least got a recipient name
    if (!metadata.recipientName) {
      console.warn(`⚠️  [LLM-INTERPRETER] No recipient name extracted - this may cause verification to fail`);
    }

    return {
      recipientName: metadata.recipientName || null,
      courseTitle: metadata.courseTitle || null,
      duration: metadata.duration || null,
      learningHours: metadata.learningHours || null,
      grade: metadata.grade || null,
      NSQFLevel: metadata.NSQFLevel || null,
      issueDate: metadata.issueDate || null,
      completionDate: metadata.completionDate || null,
      skills: metadata.skills || [],
      description: metadata.description || null,
      certificateUrl: metadata.certificateUrl || null,
      extractedBy: 'gemini-2.5-flash',
    };

  } catch (error) {
    console.error(`❌ [LLM-INTERPRETER] LLM extraction failed:`, error.message);
    throw new Error(`LLM interpretation failed: ${error.message}`);
  }
}

/**
 * Validate that extracted metadata has minimum required fields
 * 
 * @param {Object} metadata - Extracted certificate metadata
 * @returns {boolean} - true if metadata is valid
 */
export function validateMetadata(metadata) {
  console.log(`🔍 [LLM-INTERPRETER] Validating metadata completeness...`);

  // Required field: recipientName
  if (!metadata.recipientName) {
    console.warn(`⚠️  [LLM-INTERPRETER] Validation failed: missing recipientName`);
    return false;
  }

  // At least one of these should be present
  const hasAdditionalInfo =
    metadata.courseTitle ||
    metadata.issueDate ||
    metadata.completionDate;

  if (!hasAdditionalInfo) {
    console.warn(`⚠️  [LLM-INTERPRETER] Validation warning: only recipientName found, no additional context`);
    return false;
  }

  console.log(`✅ [LLM-INTERPRETER] Metadata validation passed`);
  return true;
}
