import Tesseract from 'tesseract.js';
import sharp from 'sharp';

/**
 * Pre-process image for better OCR accuracy
 */
const preprocessImage = async (imageBuffer) => {
  try {
    const processedImage = await sharp(imageBuffer)
      .grayscale() // Convert to grayscale
      .normalize() // Normalize contrast
      .sharpen() // Sharpen the image
      .toBuffer();

    return processedImage;
  } catch (error) {
    console.error('Image preprocessing error:', error);
    return imageBuffer; // Return original if preprocessing fails
  }
};

/**
 * Extract text from certificate image using Tesseract OCR
 */
export const extractTextFromImage = async (imageBuffer) => {
  try {
    console.log('Starting OCR processing...');

    // Preprocess the image
    const processedImage = await preprocessImage(imageBuffer);

    // Perform OCR with optimized settings for certificates
    // Using PSM 11 (Sparse text) with LSTM engine for best results
    const { data: { text, confidence } } = await Tesseract.recognize(
      processedImage,
      'eng',
      {
        tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT, // Best for certificates
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY, // Neural network engine
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      }
    );

    console.log(`OCR completed with confidence: ${confidence}%`);
    console.log('Extracted text length:', text.length);

    return {
      text: text.trim(),
      confidence,
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error(`OCR failed: ${error.message}`);
  }
};

/**
 * Clean and normalize OCR text
 */
export const cleanOcrText = (text) => {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
    .trim();
};
