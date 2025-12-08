import Tesseract from 'tesseract.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';
import axios from "axios";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Surya OCR service configuration
const SURYA_OCR_URL = process.env.SURYA_OCR_URL || 'http://localhost:5000';
const USE_SURYA_OCR = process.env.USE_SURYA_OCR !== 'false'; // Default to true
const SURYA_TIMEOUT = 30000; // 30 seconds

/**
 * Extract text from image using Tesseract OCR
 * @param {Buffer|string} imageSource - Buffer or file path
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromImage(imageSource) {
  try {
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const {
      data: { text },
    } = await worker.recognize(imageSource);

    await worker.terminate();

    // Clean up text
    const cleanedText = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');

    return cleanedText;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error(`OCR extraction failed: ${error.message}`);
  }
}

/**
 * Extract text from base64 image
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromBase64(base64Image) {
  try {
    // Check if it's an SVG (which needs conversion)
    const isSVG = base64Image.includes('data:image/svg+xml');

    let buffer;

    if (isSVG) {
      console.log('📊 SVG detected - converting to PNG for OCR...');

      // Remove data URI prefix
      const base64Data = base64Image.replace(/^data:image\/svg\+xml;base64,/, '');
      const svgBuffer = Buffer.from(base64Data, 'base64');

      // Convert SVG to PNG using sharp (2000px width for high quality OCR)
      buffer = await sharp(svgBuffer)
        .resize(2000, null, { // 2000px width, auto height
          fit: 'inside',
          withoutEnlargement: false,
        })
        .png()
        .toBuffer();

      console.log('✅ SVG converted to PNG successfully');
    } else {
      // Remove data URI prefix if present
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    }

    return await extractTextFromImage(buffer);
  } catch (error) {
    console.error('Base64 OCR Error:', error);
    throw new Error(`Base64 OCR extraction failed: ${error.message}`);
  }
}

/**
 * Extract text from image URL
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<string>} - Extracted text
 */

export async function extractTextFromUrl(imageUrl) {
  try {
    // 1. Download image into buffer
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    // 2. Preprocess (upscale, sharpen, grayscale)
    const processed = await sharp(buffer)
      .resize(2000)               // upscale for better OCR
      .grayscale()                // remove color
      .sharpen()                  // enhance edges
      .normalize()                // improve contrast
      .toBuffer();

    // 3. Run OCR
    return await extractTextFromImage(processed);
  } catch (error) {
    console.error("URL OCR Error:", error);
    throw new Error(`URL OCR extraction failed: ${error.message}`);
  }
}

/**
 * Extract text from base64 image using Surya OCR (Python microservice)
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromBase64WithSurya(base64Image) {
  try {
    console.log(`🔍 [SURYA-OCR] Attempting Surya OCR extraction...`);
    console.log(`🔗 [SURYA-OCR] Service URL: ${SURYA_OCR_URL}`);

    // Call Python microservice
    const response = await axios.post(
      `${SURYA_OCR_URL}/extract-text`,
      { imageData: base64Image },
      {
        timeout: SURYA_TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.data.success) {
      const { full_text, avg_confidence, num_lines, structured_data } = response.data;

      console.log(`✅ [SURYA-OCR] Extraction successful`);
      console.log(`📊 [SURYA-OCR] Confidence: ${avg_confidence?.toFixed(1)}%`);
      console.log(`📝 [SURYA-OCR] Lines: ${num_lines}`);
      console.log(`📏 [SURYA-OCR] Characters: ${full_text.length}`);

      if (structured_data) {
        console.log(`📋 [SURYA-OCR] Structured data:`, structured_data);
      }

      return full_text;
    } else {
      throw new Error(response.data.error || 'Surya OCR failed');
    }
  } catch (error) {
    // Log detailed error info
    if (error.code === 'ECONNREFUSED') {
      console.error(`❌ [SURYA-OCR] Connection refused - Is the Python service running on ${SURYA_OCR_URL}?`);
    } else if (error.code === 'ETIMEDOUT') {
      console.error(`❌ [SURYA-OCR] Request timeout after ${SURYA_TIMEOUT}ms`);
    } else {
      console.error(`❌ [SURYA-OCR] Error:`, error.message);
    }

    throw error; // Re-throw to trigger fallback
  }
}

/**
 * Extract text from base64 image with automatic fallback
 * Tries Surya OCR first, falls back to Tesseract if unavailable
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromBase64Smart(base64Image) {
  // Try Surya OCR first if enabled
  if (USE_SURYA_OCR) {
    try {
      return await extractTextFromBase64WithSurya(base64Image);
    } catch (error) {
      console.warn(`⚠️ [OCR] Surya OCR failed, falling back to Tesseract:`, error.message);
      // Fall through to Tesseract fallback
    }
  } else {
    console.log(`ℹ️ [OCR] Surya OCR disabled, using Tesseract`);
  }

  // Fallback to Tesseract
  console.log(`🔄 [OCR] Using Tesseract OCR as fallback...`);
  return await extractTextFromBase64(base64Image);
}
