/**
 * Certificate Image Extraction Pipeline
 * Identifies and extracts certificate images from scraped pages or extension screenshots
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

/**
 * Extract certificate image candidates from scraped page data
 * 
 * @param {Object} scrapedData - Data from web scraping
 * @param {Buffer} scrapedData.screenshot - Full page screenshot
 * @param {string} scrapedData.text - Page text
 * @param {string} scrapedData.url - Page URL
 * @returns {Promise<Array>} - Array of candidate images with metadata
 * 
 * Strategy:
 * 1. Navigate to URL and get all <img> tags with their URLs and sizes
 * 2. Filter by minimum size: width >= 400px AND height >= 200px
 * 3. Filter by aspect ratio based on height:
 *    - If height is 200-400px: width should be 300-1200px (ratio 0.75-3.0)
 *    - If height is 400-800px: width should be 600-2400px (ratio 0.75-3.0)
 * 4. Download filtered images and return as buffers
 * 5. Fallback to full screenshot if no suitable images found
 */
export async function extractCertificateImagesFromPage(scrapedData) {
  const { screenshot, url } = scrapedData;

  console.log(`🖼️  [CERT-EXTRACTOR] Analyzing page for certificate images...`);

  let browser = null;

  try {
    // Launch browser to analyze page structure
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`🌐 [CERT-EXTRACTOR] Loading page: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // STEP 1: Get all image tags with URLs and sizes
    const allImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));

      return images.map((img) => {
        const rect = img.getBoundingClientRect();
        return {
          src: img.src,
          alt: img.alt || '',
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          x: rect.x,
          y: rect.y,
          className: img.className || '',
          id: img.id || '',
        };
      });
    });

    console.log(`📊 [CERT-EXTRACTOR] Found ${allImages.length} total images on page`);

    // STEP 2: Filter by minimum size (width >= 400px AND height >= 200px)
    const sizeFiltered = allImages.filter((img) => {
      return img.width >= 400 && img.height >= 200;
    });

    console.log(`📏 [CERT-EXTRACTOR] ${sizeFiltered.length} images passed size filter (≥400x200px)`);

    // STEP 3: Filter by aspect ratio based on height
    const aspectRatioFiltered = sizeFiltered.filter((img) => {
      const { width, height } = img;
      const ratio = width / height;

      // Define acceptable width range based on height
      let minWidth, maxWidth;

      if (height >= 200 && height < 400) {
        // Small certificates: height 200-400px
        minWidth = height * 0.75;  // 150-300px
        maxWidth = height * 3.0;   // 600-1200px
      } else if (height >= 400 && height < 800) {
        // Medium certificates: height 400-800px
        minWidth = height * 0.75;  // 300-600px
        maxWidth = height * 3.0;   // 1200-2400px
      } else {
        // Large certificates: height >= 800px
        minWidth = height * 0.75;
        maxWidth = height * 3.0;
      }

      const isValidRatio = width >= minWidth && width <= maxWidth;
      const aspectRatio = ratio.toFixed(2);

      if (isValidRatio) {
        console.log(`  ✅ Valid: ${width}x${height} (ratio ${aspectRatio}) - range ${Math.round(minWidth)}-${Math.round(maxWidth)}px`);
      } else {
        console.log(`  ❌ Invalid: ${width}x${height} (ratio ${aspectRatio}) - outside range ${Math.round(minWidth)}-${Math.round(maxWidth)}px`);
      }

      return isValidRatio;
    });

    console.log(`✅ [CERT-EXTRACTOR] ${aspectRatioFiltered.length} images passed aspect ratio filter`);

    // STEP 4: Download filtered images
    const candidateBuffers = [];

    for (let i = 0; i < aspectRatioFiltered.length && i < 5; i++) {
      const candidate = aspectRatioFiltered[i];

      try {
        console.log(`📸 [CERT-EXTRACTOR] Downloading candidate ${i + 1}/${aspectRatioFiltered.length}: ${candidate.width}x${candidate.height}`);

        // Find the element and take screenshot
        const element = await page.evaluateHandle((src) => {
          return document.querySelector(`img[src="${src}"]`);
        }, candidate.src);

        if (element) {
          const buffer = await element.asElement().screenshot({ type: 'png' });

          candidateBuffers.push({
            image: buffer,
            source: 'page-image',
            width: candidate.width,
            height: candidate.height,
            metadata: {
              alt: candidate.alt,
              className: candidate.className,
              src: candidate.src,
              aspectRatio: (candidate.width / candidate.height).toFixed(2),
            },
          });

          console.log(`  ✅ Downloaded successfully`);
        }
      } catch (error) {
        console.warn(`  ⚠️  Failed to download candidate ${i + 1}:`, error.message);
      }
    }

    await browser.close();

    // STEP 5: Fallback - If no suitable images found, use full page screenshot
    if (candidateBuffers.length === 0) {
      console.log(`⚠️  [CERT-EXTRACTOR] No suitable images found - using full page screenshot as fallback`);

      candidateBuffers.push({
        image: screenshot,
        source: 'page-screenshot-fallback',
        width: 1920,
        height: 1080,
        metadata: {
          fallback: true,
          reason: 'No images passed size and aspect ratio filters',
        },
      });
    }

    console.log(`✅ [CERT-EXTRACTOR] Returning ${candidateBuffers.length} candidate(s)`);
    return candidateBuffers;

  } catch (error) {
    if (browser) {
      await browser.close();
    }

    console.error(`❌ [CERT-EXTRACTOR] Failed to extract images:`, error.message);

    // Return empty array - orchestrator will handle fallback
    return [];
  }
}

/**
 * Extract certificate from extension screenshot
 * 
 * @param {Object} extensionData - Data from extension
 * @param {string} extensionData.imageData - Base64 encoded screenshot
 * @returns {Promise<Array>} - Single candidate (extension already isolated cert)
 */
export async function extractCertificateFromExtension(extensionData) {
  const { imageData } = extensionData;

  console.log(`🖼️  [CERT-EXTRACTOR] Processing extension screenshot...`);

  try {
    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    console.log(`✅ [CERT-EXTRACTOR] Extension screenshot converted to buffer (${buffer.length} bytes)`);

    return [{
      image: buffer,
      source: 'extension-screenshot',
      width: null, // Unknown from extension
      height: null,
      metadata: {
        providedByExtension: true,
      },
    }];

  } catch (error) {
    console.error(`❌ [CERT-EXTRACTOR] Failed to process extension screenshot:`, error.message);
    throw new Error(`Extension screenshot processing failed: ${error.message}`);
  }
}

/**
 * Main entry point - extract certificate images based on input type
 * 
 * @param {Object} params
 * @param {string} params.inputType - 'extension' | 'manual'
 * @param {Object} params.data - Extension data or scraped data
 * @returns {Promise<Array>} - Candidate certificate images
 */
export async function extractCertificateImages(params) {
  const { inputType, data } = params;

  if (inputType === 'extension') {
    return await extractCertificateFromExtension(data);
  } else {
    return await extractCertificateImagesFromPage(data);
  }
}
