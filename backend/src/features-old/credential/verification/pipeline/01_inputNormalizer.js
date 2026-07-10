import { extractUrlFromImage } from '../../services/manualVerification.service.js';

/**
 * Normalize input to verification URL
 * 
 * @param {Object} input - Input data
 * @param {string} input.type - 'link' | 'qr' | 'extension'
 * @param {string|Buffer} input.data - URL string, image buffer, or extension data
 * @returns {Promise<Object>} - { verificationUrl, metadata }
 * 
 * @example
 * // Direct link
 * const result = await normalizeInput({ type: 'link', data: 'https://coursera.org/verify/ABC123' });
 * 
 * @example
 * // QR code image
 * const result = await normalizeInput({ type: 'qr', data: imageBuffer });
 * 
 * @example
 * // Extension data
 * const result = await normalizeInput({ type: 'extension', data: { sourceUrl: '...' } });
 */
export async function normalizeInput(input) {
  const { type, data } = input;

  console.log(`🔄 [INPUT-NORMALIZER] Processing input type: ${type}`);

  try {
    switch (type) {
      case 'link': {
        // Direct URL - validate and return
        const url = typeof data === 'string' ? data.trim() : data;

        // Validate URL format
        try {
          new URL(url);
        } catch (error) {
          throw new Error(`Invalid URL format: ${error.message}`);
        }

        console.log(`✅ [INPUT-NORMALIZER] Direct link validated: ${url}`);

        return {
          verificationUrl: url,
          metadata: {
            inputType: 'link',
            qrCodeFound: false,
          },
        };
      }

      case 'qr': {
        // QR code image - extract URL
        console.log(`🔍 [INPUT-NORMALIZER] Extracting URL from QR code...`);

        const extractedUrl = await extractUrlFromImage(data);

        // Validate extracted URL
        try {
          new URL(extractedUrl);
        } catch (error) {
          throw new Error(`QR code contains invalid URL: ${error.message}`);
        }

        console.log(`✅ [INPUT-NORMALIZER] QR code decoded: ${extractedUrl}`);

        return {
          verificationUrl: extractedUrl,
          metadata: {
            inputType: 'qr',
            qrCodeFound: true,
          },
        };
      }

      case 'extension': {
        // Extension data - extract sourceUrl
        const sourceUrl = data?.sourceUrl || data?.url;

        if (!sourceUrl) {
          throw new Error('Extension data missing sourceUrl field');
        }

        // Validate URL
        try {
          new URL(sourceUrl);
        } catch (error) {
          throw new Error(`Extension sourceUrl is invalid: ${error.message}`);
        }

        console.log(`✅ [INPUT-NORMALIZER] Extension URL validated: ${sourceUrl}`);

        return {
          verificationUrl: sourceUrl,
          metadata: {
            inputType: 'extension',
            qrCodeFound: false,
            hasScreenshot: !!data?.imageData,
            hasExtractedText: !!data?.extractedText,
          },
        };
      }

      default:
        throw new Error(`Unknown input type: ${type}. Expected 'link', 'qr', or 'extension'`);
    }
  } catch (error) {
    console.error(`❌ [INPUT-NORMALIZER] Failed to normalize input:`, error.message);
    throw error;
  }
}

/**
 * Validate that a URL is properly formatted
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} - true if valid
 * @throws {Error} - if invalid
 */
export function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('URL must be a non-empty string');
  }

  try {
    const urlObj = new URL(url);

    // Must be HTTP or HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('URL must use HTTP or HTTPS protocol');
    }

    return true;
  } catch (error) {
    throw new Error(`Invalid URL: ${error.message}`);
  }
}
