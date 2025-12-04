import Tesseract from 'tesseract.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';
import axios from "axios";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
