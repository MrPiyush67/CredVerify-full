/**
 * Manual Verification Service
 * Handles QR code extraction and web scraping for certificate verification
 */

import { Jimp } from 'jimp';
import jsQR from 'jsqr';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// ============================================
// PUPPETEER SETUP
// ============================================

/**
 * Configure puppeteer with stealth plugin
 * This prevents detection by anti-bot systems
 */
puppeteer.use(StealthPlugin());

// ============================================
// QR CODE EXTRACTION
// ============================================

/**
 * Extract URL from QR code in certificate image
 * 
 * @param {Buffer} imageBuffer - Image file buffer from multer
 * @returns {Promise<string>} - Extracted URL from QR code
 * @throws {Error} - If no QR code is found or image processing fails
 * 
 * @example
 * const url = await extractUrlFromImage(req.file.buffer);
 * // Returns: "https://coursera.org/verify/ABC123"
 */
export async function extractUrlFromImage(imageBuffer) {
  try {
    console.log('🔍 [QR-EXTRACT] Reading image buffer...');

    // ============================================
    // STEP 1: Load image with Jimp
    // ============================================
    const image = await Jimp.read(imageBuffer);

    console.log(`📐 [QR-EXTRACT] Image dimensions: ${image.bitmap.width}x${image.bitmap.height}`);

    // ============================================
    // STEP 2: Get raw pixel data
    // ============================================
    const { width, height, data } = image.bitmap;

    // jsQR expects RGBA pixel data
    // Jimp provides it in the exact format needed
    const imageData = {
      data: new Uint8ClampedArray(data),
      width,
      height,
    };

    console.log('🔎 [QR-EXTRACT] Scanning for QR code...');

    // ============================================
    // STEP 3: Scan for QR code
    // ============================================
    const qrCode = jsQR(imageData.data, width, height);

    if (!qrCode) {
      throw new Error('No QR code detected in the image');
    }

    console.log('✅ [QR-EXTRACT] QR code found!');
    console.log(`📍 [QR-EXTRACT] QR location: (${qrCode.location.topLeftCorner.x}, ${qrCode.location.topLeftCorner.y})`);

    // ============================================
    // STEP 4: Extract and validate URL
    // ============================================
    const extractedData = qrCode.data;

    if (!extractedData) {
      throw new Error('QR code is empty');
    }

    console.log(`📝 [QR-EXTRACT] QR data: ${extractedData}`);
    console.log(`📏 [QR-EXTRACT] Data length: ${extractedData.length} characters`);
    console.log(`🔤 [QR-EXTRACT] Data type: ${typeof extractedData}`);

    // Validate that it's a URL
    try {
      new URL(extractedData);
      console.log('✅ [QR-EXTRACT] Valid URL format');
    } catch (error) {
      console.error(`❌ [QR-EXTRACT] Invalid URL format: ${error.message}`);
      throw new Error(`QR code does not contain a valid URL. Found: "${extractedData.substring(0, 100)}${extractedData.length > 100 ? '...' : ''}"`);
    }

    return extractedData;
  } catch (error) {
    console.error('❌ [QR-EXTRACT] Error:', error.message);
    throw error;
  }
}

// ============================================
// WEB SCRAPING
// ============================================

/**
 * Scrape certificate verification page using Puppeteer
 * Optimized to block unnecessary resources (images, fonts, stylesheets)
 * 
 * @param {string} url - Certificate verification URL
 * @returns {Promise<Object>} - { screenshot: Buffer, text: string, url: string }
 * @throws {Error} - If scraping fails
 * 
 * @example
 * const result = await scrapeCertificate("https://coursera.org/verify/ABC123");
 * // Returns: { screenshot: <Buffer>, text: "Certificate of...", url: "..." }
 */
export async function scrapeCertificate(url) {
  let browser = null;

  try {
    console.log('🚀 [SCRAPER] Launching browser...');

    // ============================================
    // STEP 1: Launch browser with stealth mode
    // ============================================
    browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode (faster, more stable)
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
    });

    const page = await browser.newPage();

    // Set viewport for consistent screenshots
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    // Set user agent to appear as regular browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    console.log('⚡ [SCRAPER] Enabling request interception for optimization...');

    // ============================================
    // STEP 2: Enable request interception
    // CRITICAL OPTIMIZATION: Block unnecessary resources
    // ============================================
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      const resourceType = request.resourceType();

      // Block fonts, stylesheets, media to speed up loading
      // Keep images since certificateExtractor will need them
      if (['font', 'stylesheet', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        // Allow: document, script, xhr, fetch, images, etc.
        request.continue();
      }
    });

    console.log(`🌐 [SCRAPER] Navigating to: ${url}`);

    // ============================================
    // STEP 3: Navigate to the URL
    // ============================================
    await page.goto(url, {
      waitUntil: 'networkidle2', // Wait until network is mostly idle
      timeout: 60000, // 60 second timeout for JS-heavy pages
    });

    console.log('✅ [SCRAPER] Page loaded successfully');

    // ============================================
    // STEP 4: Extract page content (COMMENTED OUT - TO BE IMPLEMENTED LATER)
    // ============================================

    // Wait a bit for any dynamic content to render
    // await new Promise(resolve => setTimeout(resolve, 2000));

    // TODO: Implement screenshot extraction later
    // console.log('📸 [SCRAPER] Taking screenshot...');
    // const screenshot = await page.screenshot({
    //   fullPage: true,
    //   type: 'png',
    // });

    // TODO: Implement text extraction later
    // console.log('📝 [SCRAPER] Extracting text content...');
    // const text = await page.evaluate(() => {
    //   const bodyText = document.body.innerText || document.body.textContent || '';
    //   return bodyText.replace(/\s+/g, ' ').trim();
    // });

    console.log('✅ [SCRAPER] Scraping complete (screenshot & text extraction pending)');

    // ============================================
    // STEP 5: Return scraped data
    // ============================================
    return {
      screenshot: null, // TODO: Will be implemented later
      text: null,       // TODO: Will be implemented later
      url,              // String
    };
  } catch (error) {
    console.error('❌ [SCRAPER] Error:', error.message);
    throw new Error(`Failed to scrape certificate page: ${error.message}`);
  } finally {
    // ============================================
    // CLEANUP: Always close the browser
    // ============================================
    if (browser) {
      console.log('🧹 [SCRAPER] Closing browser...');
      await browser.close();
    }
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Validate if a string is a valid URL
 * 
 * @param {string} str - String to validate
 * @returns {boolean} - True if valid URL
 */
export function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 * 
 * @param {string} url - Full URL
 * @returns {string} - Domain name
 * 
 * @example
 * extractDomain("https://coursera.org/verify/ABC123") // "coursera.org"
 */
export function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}
