import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

/*
 Extract certificate image candidates from scraped page data

 Strategy:
 1. Navigate to URL and get all <img> tags with their URLs and sizes
 2. Filter by minimum size: width >= 400px AND height >= 200px
 3. Filter by aspect ratio based on height:
    - If height is 200-400px: width should be 300-1200px (ratio 0.75-3.0)
    - If height is 400-800px: width should be 600-2400px (ratio 0.75-3.0)
 4. Download filtered images and return as buffers
 5. Fallback to full screenshot if no suitable images found
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

    // Enable request interception to block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      // Block fonts, stylesheets, media - but ALLOW images (we need them!)
      if (['font', 'stylesheet', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    console.log(`🌐 [CERT-EXTRACTOR] Loading page: ${url}`);
    await page.goto(url, {
      waitUntil: 'domcontentloaded', // Faster than networkidle0
      timeout: 60000 // 60 seconds for JS-heavy pages like Coursera
    });

    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // STEP 1: Get all image tags with URLs and sizes
    const allImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const seenUrls = new Set();

      return images
        .map((img) => {
          const rect = img.getBoundingClientRect();
          return {
            src: img.src,
            alt: img.alt || '',
            width: img.naturalWidth || Math.round(rect.width), // Use natural width, fallback to rendered
            height: img.naturalHeight || Math.round(rect.height), // Use natural height, fallback to rendered
            x: rect.x,
            y: rect.y,
            className: img.className || '',
            id: img.id || '',
          };
        })
        .filter((img) => {
          // Only take unique URLs - skip duplicates
          if (seenUrls.has(img.src)) {
            return false;
          }
          seenUrls.add(img.src);
          return true;
        });
    });

    console.log(`📊 [CERT-EXTRACTOR] Found ${allImages.length} total images on page`);

    // STEP 2: Filter by minimum size (height >= 200px AND width >= 400px)
    const sizeFiltered = allImages.filter((img) => {
      const valid = img.height >= 200 && img.width >= 400;
      if (valid) {
        console.log(`  ✅ Size valid: ${img.width}x${img.height}`);
      }
      return valid;
    });

    console.log(`📏 [CERT-EXTRACTOR] ${sizeFiltered.length} images passed size filter (height≥200px, width≥400px)`);

    // STEP 3: Filter by aspect ratio
    // Choose aspect ratio range, take width of each image,
    // calculate required height based on aspect ratio
    const MIN_ASPECT_RATIO = 1.0;  // width/height (e.g., 1.0 = square)
    const MAX_ASPECT_RATIO = 3.0;  // width/height (e.g., 3.0 = wide landscape)

    const aspectRatioFiltered = sizeFiltered.filter((img) => {
      const { width, height } = img;

      // Calculate expected height range based on width and aspect ratio
      const minHeight = width / MAX_ASPECT_RATIO;  // For max ratio (widest)
      const maxHeight = width / MIN_ASPECT_RATIO;  // For min ratio (tallest)

      // Check if actual height lies within the calculated range
      const isValid = height >= minHeight && height <= maxHeight;
      const actualRatio = (width / height).toFixed(2);

      if (isValid) {
        console.log(`  ✅ Valid: ${width}x${height} (ratio ${actualRatio}) - height range ${Math.round(minHeight)}-${Math.round(maxHeight)}px`);
      } else {
        console.log(`  ❌ Invalid: ${width}x${height} (ratio ${actualRatio}) - height ${height} outside range ${Math.round(minHeight)}-${Math.round(maxHeight)}px`);
      }

      return isValid;
    });

    console.log(`✅ [CERT-EXTRACTOR] ${aspectRatioFiltered.length} images passed aspect ratio filter`);

    await browser.close();

    // STEP 4: Return image URLs (NO FALLBACK - strict filtering only)
    if (aspectRatioFiltered.length === 0) {
      console.log(`⚠️  [CERT-EXTRACTOR] No images passed filters - returning empty array`);
      return [];
    }

    // Return all valid images with their URLs
    const candidateImages = aspectRatioFiltered.map((img, index) => {
      console.log(`   ${index + 1}. ${img.width}x${img.height} - ${img.src}`);

      return {
        imageUrl: img.src,
        source: 'page-image',
        width: img.width,
        height: img.height,
        metadata: {
          alt: img.alt,
          className: img.className,
          aspectRatio: (img.width / img.height).toFixed(2),
          index: index + 1,
        },
      };
    });

    console.log(`✅ [CERT-EXTRACTOR] Returning ${candidateImages.length} image URL(s)`);
    return candidateImages;

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
