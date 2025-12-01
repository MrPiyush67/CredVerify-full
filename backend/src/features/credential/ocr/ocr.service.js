import Tesseract from 'tesseract.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
    // Remove data URI prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

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
    return await extractTextFromImage(imageUrl);
  } catch (error) {
    console.error('URL OCR Error:', error);
    throw new Error(`URL OCR extraction failed: ${error.message}`);
  }
}
