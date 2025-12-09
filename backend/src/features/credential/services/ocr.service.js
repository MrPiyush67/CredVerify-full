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
 * Extract text using Surya OCR service
 * @param {Buffer|string} imageSource - Buffer or file path
 * @returns {Promise<string>} - Extracted text
 */
async function extractWithSuryaOcr(imageSource) {
  try {
    // Convert to base64 if it's a buffer
    let base64Image;
    if (Buffer.isBuffer(imageSource)) {
      base64Image = imageSource.toString('base64');
    } else {
      // If it's a file path, read it
      const fs = await import('fs/promises');
      const fileBuffer = await fs.readFile(imageSource);
      base64Image = fileBuffer.toString('base64');
    }

    // Call Surya OCR service
    const response = await axios.post(
      `${SURYA_OCR_URL}/extract-text`,
      { imageData: base64Image },
      {
        timeout: SURYA_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'Invalid response from Surya OCR service');
    }

    // Extract text from Surya response
    const extractedText = response.data.full_text || '';

    // Clean up text
    const cleanedText = extractedText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');

    return cleanedText;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`Surya OCR service is not running on ${SURYA_OCR_URL}`);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Surya OCR request timed out');
    }
    throw error;
  }
}

/**
 * Extract text from image using Tesseract OCR (fallback)
 * @param {Buffer|string} imageSource - Buffer or file path
 * @returns {Promise<string>} - Extracted text
 */
async function extractWithTesseract(imageSource) {
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
}

/**
 * Extract text from image using Surya OCR (with Tesseract fallback)
 * @param {Buffer|string} imageSource - Buffer or file path
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromImage(imageSource) {
  // Try Surya OCR first if enabled
  if (USE_SURYA_OCR) {
    try {
      console.log('🔍 [OCR] Attempting Surya OCR...');
      const suryaResult = await extractWithSuryaOcr(imageSource);
      console.log('✅ [OCR] Surya OCR successful');
      return suryaResult;
    } catch (error) {
      console.warn('⚠️  [OCR] Surya OCR failed, falling back to Tesseract:', error.message);
      // Fall through to Tesseract
    }
  }

  // Fallback to Tesseract OCR
  try {
    console.log('🔍 [OCR] Using Tesseract OCR...');
    const tesseractResult = await extractWithTesseract(imageSource);
    console.log('✅ [OCR] Tesseract OCR successful');
    return tesseractResult;
  } catch (error) {
    console.error('❌ [OCR] Tesseract Error:', error);
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
