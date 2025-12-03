import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

// Create reusable transporter with Gmail configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'piyushtest10067@gmail.com',
      pass: process.env.EMAIL_PASSWORD || '',
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 60000, // 60 seconds - generous timeout
    greetingTimeout: 30000,
    socketTimeout: 30000,
    pool: true, // Use connection pooling
    maxConnections: 5,
    debug: false, // Disable verbose logging
    logger: false,
  });
};

/**
 * Send email with or without attachments
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {Array} options.attachments - Optional attachments array
 */
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"CredVerify Platform" <${process.env.EMAIL_USER || 'piyushtest10067@gmail.com'}>`,
      to,
      subject,
      html,
      attachments,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

/**
 * Send credential certificate via email
 * @param {Object} options - Credential email options
 */
export const sendCredentialEmail = async ({ to, recipientName, credentialName, pdfBuffer }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1a202c;
          background-color: #f7fafc;
          padding: 20px;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }
        .header {
          background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .header p {
          font-size: 16px;
          opacity: 0.95;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #2d3748;
          margin-bottom: 20px;
        }
        .message {
          font-size: 15px;
          color: #4a5568;
          margin-bottom: 24px;
          line-height: 1.7;
        }
        .credential-card {
          background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
          border-left: 4px solid #14b8a6;
          padding: 24px;
          border-radius: 8px;
          margin: 24px 0;
        }
        .credential-card h3 {
          color: #0f766e;
          font-size: 18px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .credential-details {
          display: grid;
          gap: 12px;
        }
        .detail-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .detail-label {
          font-weight: 600;
          color: #2d3748;
          min-width: 120px;
        }
        .detail-value {
          color: #4a5568;
        }
        .badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }
        .next-steps {
          background: #f9fafb;
          padding: 24px;
          border-radius: 8px;
          margin: 24px 0;
        }
        .next-steps h4 {
          color: #1f2937;
          font-size: 16px;
          margin-bottom: 12px;
        }
        .next-steps ul {
          list-style: none;
          padding: 0;
        }
        .next-steps li {
          color: #4b5563;
          padding: 8px 0;
          padding-left: 24px;
          position: relative;
          font-size: 14px;
        }
        .next-steps li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: bold;
        }
        .cta-button {
          display: inline-block;
          background: #14b8a6;
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin-top: 24px;
          transition: background 0.3s;
        }
        .cta-button:hover {
          background: #0d9488;
        }
        .button-container {
          text-align: center;
          margin: 32px 0;
        }
        .footer {
          background: #f9fafb;
          padding: 24px 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          color: #6b7280;
          font-size: 13px;
          margin: 4px 0;
        }
        .footer-brand {
          font-weight: 600;
          color: #14b8a6;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🎓 Congratulations, ${recipientName}!</h1>
          <p>Your Micro-Credential Has Been Issued</p>
        </div>
        
        <div class="content">
          <p class="greeting">Dear ${recipientName},</p>
          
          <p class="message">
            We are delighted to inform you that your micro-credential has been successfully issued and verified by the <strong>CredVerify Platform</strong>. Your certificate is now ready!
          </p>
          
          <div class="credential-card">
            <h3>📜 Credential Information</h3>
            <div class="credential-details">
              <div class="detail-row">
                <span class="detail-label">Credential Name:</span>
                <span class="detail-value"><strong>${credentialName}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="badge">Verified & Issued</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Issue Date:</span>
                <span class="detail-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
          
          <p class="message">
            Your official credential certificate is attached to this email as a PDF document. You can download, print, or share it with employers and educational institutions.
          </p>
          
          <div class="next-steps">
            <h4>What's Next?</h4>
            <ul>
              <li>View and manage your credentials on your CredVerify profile</li>
              <li>Share your achievement on LinkedIn and social media</li>
              <li>Add this credential to your resume and portfolio</li>
              <li>Verify your certificate anytime using the QR code</li>
            </ul>
          </div>
          
          <div class="button-container">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/profile" class="cta-button">View My Credentials</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong class="footer-brand">CredVerify</strong> - Verify Your Achievements</p>
          <p>© ${new Date().getFullYear()} CredVerify Platform. All rights reserved.</p>
          <p style="margin-top: 12px; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Your ${credentialName} Credential Certificate`,
    html,
    attachments: [
      {
        filename: `${credentialName.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
};
