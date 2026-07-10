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
 * @param {string} options.to - Recipient email
 * @param {string} options.recipientName - Recipient name
 * @param {string} options.credentialName - Credential name
 * @param {Buffer} options.pdfBuffer - PDF buffer
 * @param {boolean} options.isNewUser - Whether this is a new user account
 * @param {string} options.loginEmail - Login email for new users
 * @param {string} options.loginPassword - Login password for new users
 */
export const sendCredentialEmail = async ({
  to,
  recipientName,
  credentialName,
  pdfBuffer,
  isNewUser = false,
  loginEmail = '',
  loginPassword = '',
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="background: #0d9488; color: white; padding: 20px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">🎓 Credential Issued</h1>
      </div>
      
      <p><strong>Dear ${recipientName},</strong></p>
      
      <p>Your <strong>${credentialName}</strong> credential has been successfully issued and verified by CredVerify Platform.</p>
      
      <div style="background: #f0f9ff; border-left: 4px solid #0d9488; padding: 15px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Status:</strong> Verified & Issued</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      ${
        isNewUser
          ? `
      <div style="background: #fff3cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <p style="margin: 5px 0 10px 0;"><strong>🔑 Login Credentials</strong></p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${loginEmail}</p>
        <p style="margin: 5px 0;"><strong>Password:</strong> ${loginPassword}</p>
        <p style="margin: 10px 0 5px 0; color: #d97706; font-size: 13px;">⚠️ Change your password after first login.</p>
      </div>
      `
          : ''
      }
      
      <p>Your certificate is attached as a PDF.</p>
      
      <div style="margin: 20px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/profile" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">View My Credentials</a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      
      <p style="text-align: center; color: #666; font-size: 12px;">
        <strong>CredVerify</strong> © ${new Date().getFullYear()}<br>
        This is an automated message. Do not reply.
      </p>
      
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
