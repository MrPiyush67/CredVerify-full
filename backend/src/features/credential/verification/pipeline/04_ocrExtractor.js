/**
 * OCR Extraction Pipeline
 * Extracts text from certificate images using Tesseract.js
 * 
 * Reuses: ocr.service.js from /ocr/
 */

import { extractTextFromImage, extractTextFromBase64 } from '../../services/ocr.service.js';

/**
 * Extract text from certificate image buffer
 * 
 * @param {Buffer} imageBuffer - Certificate image as buffer
 * @returns {Promise<Object>} - { text, confidence, wordCount }
 * 
 * @example
 * const result = await extractText(certificateBuffer);
 * // Returns: { text: "CERTIFICATE OF...", confidence: 95, wordCount: 150 }
 */
export async function extractText(imageBuffer) {
  console.log(`🔍 [OCR-EXTRACTOR] Starting OCR extraction...`);

  try {
    const text = await extractTextFromImage(imageBuffer);

    // Calculate basic metrics
    const wordCount = text.trim().split(/\s+/).length;
    const charCount = text.length;

    // Estimate confidence based on text length
    let confidence = 0;
    if (charCount > 200) {
      confidence = 95;
    } else if (charCount > 100) {
      confidence = 85;
    } else if (charCount > 50) {
      confidence = 70;
    } else if (charCount > 20) {
      confidence = 50;
    } else {
      confidence = 30;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ [OCR-EXTRACTOR] Extraction Complete`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📊 Confidence: ${confidence}%`);
    console.log(`📝 Words: ${wordCount} | Characters: ${charCount}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📄 Extracted Text:\n`);
    console.log(text);
    console.log(`\n${'='.repeat(60)}\n`);

    return {
      text,
      confidence,
      wordCount,
      charCount,
    };

  } catch (error) {
    console.error(`❌ [OCR-EXTRACTOR] OCR failed:`, error.message);
    throw new Error(`OCR extraction failed: ${error.message}`);
  }
}

/**
 * Extract text from base64 encoded image (for extension flow)
 * 
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Object>} - { text, confidence, wordCount }
 */
export async function extractTextFromBase64Image(base64Image) {
  console.log(`🔍 [OCR-EXTRACTOR] Extracting from base64 image...`);

  try {
    const text = await extractTextFromBase64(base64Image);

    const wordCount = text.trim().split(/\s+/).length;
    const charCount = text.length;

    let confidence = 0;
    if (charCount > 200) {
      confidence = 95;
    } else if (charCount > 100) {
      confidence = 85;
    } else if (charCount > 50) {
      confidence = 70;
    } else {
      confidence = 30;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ [OCR-EXTRACTOR] Base64 Extraction Complete`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📊 Confidence: ${confidence}%`);
    console.log(`📝 Words: ${wordCount} | Characters: ${charCount}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📄 Extracted Text from Base64:\n`);
    console.log(text);
    console.log(`\n${'='.repeat(60)}\n`);

    return {
      text,
      confidence,
      wordCount,
      charCount,
    };

  } catch (error) {
    console.error(`❌ [OCR-EXTRACTOR] Base64 OCR failed:`, error.message);
    throw new Error(`Base64 OCR extraction failed: ${error.message}`);
  }
}

/**
 * Filter OCR candidates by quality (minimum text requirements)
 * 
 * @param {Array} candidates - Array of { image, ocrResult } objects
 * @returns {Array} - Filtered candidates with sufficient text
 */
export function filterOcrCandidates(candidates) {
  console.log(`🔍 [OCR-EXTRACTOR] Filtering ${candidates.length} candidates by text quality...`);

  const MIN_WORD_COUNT = 10;
  const MIN_CHAR_COUNT = 50;

  const filtered = candidates.filter((candidate) => {
    const { ocrResult } = candidate;

    if (!ocrResult || !ocrResult.text) {
      return false;
    }

    const meetsMinimum =
      ocrResult.wordCount >= MIN_WORD_COUNT ||
      ocrResult.charCount >= MIN_CHAR_COUNT;

    if (meetsMinimum) {
      console.log(`  ✅ Candidate passed: ${ocrResult.wordCount} words, ${ocrResult.charCount} chars`);
    } else {
      console.log(`  ❌ Candidate rejected: ${ocrResult.wordCount} words, ${ocrResult.charCount} chars (too little text)`);
    }

    return meetsMinimum;
  });

  console.log(`✅ [OCR-EXTRACTOR] ${filtered.length}/${candidates.length} candidates passed quality filter`);

  return filtered;
}
