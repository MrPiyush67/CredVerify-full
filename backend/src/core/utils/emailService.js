import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

// Create reusable transporter with Gmail configuration or a dev fallback
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    // Dev fallback: don't throw – log the email as JSON instead of sending
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    pool: true,
    maxConnections: 5,
    debug: false,
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
      from: `"CredVerify Platform" <${process.env.EMAIL_USER || 'no-reply@credverify.local'}>`,
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
export const sendCredentialEmail = async ({ to, recipientName, credentialName, pdfBuffer, profileUrl, newUser }) => {
  const profileLink = profileUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/profile`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f3f4f6;color:#0f172a;padding:24px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
        .card{max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;box-shadow:0 2px 6px rgba(15,23,42,0.06)}
        .head{padding:20px 24px;background:linear-gradient(135deg,#2B7C8E,#3CAEA3);color:#ffffff}
        .head h1{font-size:22px;margin:0;letter-spacing:0.2px}
        .subtitle{font-size:14px;opacity:0.9;margin-top:4px}
        .body{padding:20px 24px}
        .muted{color:#6b7280;font-size:14px}
        .btn{display:inline-block;background:#3CAEA3;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600}
        .section{margin-top:16px;padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px}
        .row{display:flex;gap:8px;margin:6px 0;font-size:14px}
        .label{min-width:100px;color:#374151;font-weight:600}
        .footer{padding:14px 24px;background:#f9fafb;color:#6b7280;font-size:12px;text-align:center;border-top:1px solid #e5e7eb}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="head">
          <h1>🎉 Congrats, ${recipientName}!</h1>
          <div class="subtitle">Your credential has been issued by CredVerify</div>
        </div>
        <div class="body">
          <p>Your credential <strong>${credentialName}</strong> has been issued.</p>
          <p class="muted">You can view it anytime in your CredVerify profile.</p>

          <p style="margin:16px 0"><a class="btn" href="${profileLink}">View Profile</a></p>

          ${newUser ? `
          <div class="section">
            <p><strong>Your profile is created and you are now a member of CredVerify.</strong></p>
            <div class="row"><span class="label">Email:</span><span>${newUser.email}</span></div>
            <div class="row"><span class="label">Full Name:</span><span>${newUser.realName}</span></div>
            <div class="row"><span class="label">Username:</span><span>${newUser.username}</span></div>
            <div class="row"><span class="label">Password:</span><span>${newUser.password}</span></div>
          </div>
          ` : ''}

          <div class="section">
            <p>📎 The certificate PDF is attached to this email.</p>
          </div>
        </div>
        <div class="footer">© ${new Date().getFullYear()} CredVerify</div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Your ${credentialName} Certificate`,
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
