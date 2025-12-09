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

console.log('🔧 [OCR-SERVICE] Configuration loaded:');
console.log('   SURYA_OCR_URL:', SURYA_OCR_URL);
console.log('   USE_SURYA_OCR:', USE_SURYA_OCR);
console.log('   process.env.SURYA_OCR_URL:', process.env.SURYA_OCR_URL);
console.log('   process.env.USE_SURYA_OCR:', process.env.USE_SURYA_OCR);

/**
 * Extract text from image using Surya OCR service
 * @param {Buffer|string} imageSource - Buffer or file path
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextWithSurya(imageSource) {
  try {
    console.log('🔍 [SURYA-OCR] Attempting to extract text using Surya OCR service...');

    // Convert image to base64 if it's a buffer
    let base64Image;
    if (Buffer.isBuffer(imageSource)) {
      base64Image = imageSource.toString('base64');
    } else {
      // Assume it's a file path, read it
      const fs = await import('fs');
      const imageBuffer = fs.readFileSync(imageSource);
      base64Image = imageBuffer.toString('base64');
    }

    // Prepare the request payload
    const payload = {
      imageData: `data:image/png;base64,${base64Image}`
    };

    console.log(`🌐 [SURYA-OCR] Sending request to ${SURYA_OCR_URL}/extract-text`);

    // Call Surya OCR service
    const response = await axios.post(`${SURYA_OCR_URL}/extract-text`, payload, {
      timeout: SURYA_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.success && response.data.full_text) {
      console.log('✅ [SURYA-OCR] Successfully extracted text using Surya OCR');
      return response.data.full_text;
    } else if (response.data && !response.data.success) {
      throw new Error(response.data.error || 'Surya OCR extraction failed');
    } else {
      throw new Error('Invalid response format from Surya OCR service');
    }

  } catch (error) {
    console.error('❌ [SURYA-OCR] Error:', error.message);
    throw error;
  }
}

/**
 * Extract text from image using Tesseract OCR (fallback)
 * @param {Buffer|string} imageSource - Buffer or file path
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextWithTesseract(imageSource) {
  try {
    console.log('🔤 [TESERACT-OCR] Using Tesseract OCR as fallback...');

    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

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

    console.log('✅ [TESERACT-OCR] Successfully extracted text using Tesseract');
    return cleanedText;
  } catch (error) {
    console.error('❌ [TESERACT-OCR] Error:', error);
    throw new Error(`Tesseract OCR extraction failed: ${error.message}`);
  }
}

/**
 * Extract text from image using Surya OCR (primary) with Tesseract fallback
 * @param {Buffer|string} imageSource - Buffer or file path
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromImage(imageSource) {
  try {
    // Try Surya OCR first if enabled
    if (USE_SURYA_OCR) {
      try {
        return await extractTextWithSurya(imageSource);
      } catch (suryaError) {
        console.warn('⚠️ [OCR-SERVICE] Surya OCR failed, falling back to Tesseract:', suryaError.message);
        return await extractTextWithTesseract(imageSource);
      }
    } else {
      // Use Tesseract directly if Surya is disabled
      console.log('🔧 [OCR-SERVICE] Surya OCR disabled, using Tesseract only');
      return await extractTextWithTesseract(imageSource);
    }
  } catch (error) {
    console.error('❌ [OCR-SERVICE] All OCR methods failed:', error);
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
