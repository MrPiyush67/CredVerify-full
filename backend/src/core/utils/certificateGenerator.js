import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate certificate HTML using actual template image as background
 */
const generateCertificateHTML = async ({
  recipientName,
  credentialName,
  issueDate,
  hours,
  nsqfLevel,
  instructorName = 'Admin',
  certificateId = null,
}) => {
  const formattedDate = new Date(issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).replace(',', '');

  // Generate or use provided certificate ID for verification
  const verificationId = certificateId || new mongoose.Types.ObjectId().toString();
  const certificateUrl = `https://localhost:5173/verify/${verificationId}`;

  // Read the template image and convert to base64
  const templatePath = path.join(__dirname, '../../../../frontend/public/credantial-template/Certificatetemplatenocontent.png');
  let templateImageBase64 = '';

  try {
    const imageBuffer = await fs.readFile(templatePath);
    templateImageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Template image not found, using fallback');
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4 landscape;
          margin: 0;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          width: 297mm;
          height: 210mm;
          position: relative;
          overflow: hidden;
          background: white;
        }
        .certificate-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('${templateImageBase64}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .content {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 100%;
          padding: 50px 90px 55px 90px;
          display: flex;
          flex-direction: column;
        }
        
        /* Header */
        .header {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
          margin-bottom: 40px;
        }
        
        .cert-url {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          color: #4A5568;
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin-top: -35px;
        }
        
        .cert-title {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 400;
          font-style: italic;
          color: #000000;
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }
        
        .cert-title-of {
          font-family: 'Georgia', serif;
          font-size: 48px;
          font-weight: 400;
          font-style: normal;
          color: #000000;
          margin-left: 8px;
        }
        
        .course-name {
          font-family: 'Montserrat', sans-serif;
          font-size: 46px;
          font-weight: 900;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 42px;
          line-height: 1.1;
          margin-top: 8px;
        }
        
        .recipient-name {
          font-family: 'Playfair Display', serif;
          font-size: 62px;
          font-weight: 400;
          font-style: italic;
          color: #000000;
          border-bottom: 3px solid #2D3748;
          padding: 0 50px 10px;
          margin-bottom: 0;
          display: inline-block;
        }

        /* Footer */
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-family: 'Montserrat', sans-serif;
          margin-top: auto;
          position: relative;
        }
        
        .footer-left {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .footer-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: 0;
        }
        
        .footer-right {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }
        
        .info-text {
          font-size: 18px;
          font-weight: 700;
          color: #000000;
          line-height: 1.4;
        }
        
        .info-label {
          font-weight: 700;
          color: #000000;
        }
        
        .qr-code {
          width: 115px;
          height: 115px;
          background: white;
          border: 2px solid #D1D5DB;
          padding: 5px;
          margin-bottom: 4px;
        }
      </style>
    </head>
    <body>
      <div class="certificate-bg"></div>
      <div class="content">
        <div class="header">
          <div class="cert-url">Certificate Url:  ${certificateUrl}</div>
        </div>

        <div class="main-content">
          <div>
            <span class="cert-title">Certificate</span><span class="cert-title-of"> of Completation</span>
          </div>
          <div class="course-name">${credentialName}</div>
          <div class="recipient-name">${recipientName}</div>
        </div>

        <div class="footer">
          <div class="footer-left">
            <div class="info-text">Date : <span class="info-label">${formattedDate}</span></div>
            <div class="info-text">Length : <span class="info-label">${hours} total hours</span></div>
          </div>

          <div class="footer-center">
            <div class="info-text">Instructors : <span class="info-label">${instructorName}</span></div>
          </div>

          <div class="footer-right">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificateUrl)}&margin=0" class="qr-code" alt="QR Code" />
            <div class="info-text">NSQF : <span class="info-label">level ${nsqfLevel}</span></div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate PDF certificate from HTML template
 * @param {Object} data - Certificate data
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generateCertificatePDF = async (data) => {
  let browser;
  try {
    const html = await generateCertificateHTML(data);

    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set content and wait for fonts/images to load
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};
