import { generateCertificatePDF } from '../../core/utils/certificateGenerator.js';
import { sendCredentialEmail } from '../../core/utils/emailService.js';
import Credential from './credential.model.js';
import User from '../user/user.model.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create certificates directory if it doesn't exist
const certsDir = path.join(__dirname, '../../../certificates');
await fs.mkdir(certsDir, { recursive: true }).catch(() => {});

/**
 * Issue bulk credentials to multiple recipients
 * @param {string} validantId - ID of the validant issuing credentials
 * @param {Object} credentialData - Common credential data
 * @param {Array} recipients - Array of recipient objects {name, email}
 */
export const issueBulkCredentials = async (validantId, credentialData, recipients) => {
  const { credentialName, issueDate, hours, nsqfLevel } = credentialData;
  
  // Fetch validant details for instructor name
  const validant = await User.findById(validantId).select('name');
  const instructorName = validant?.name || 'Admin';
  
  const results = {
    successful: [],
    failed: [],
  };

  // Process each recipient
  for (const recipient of recipients) {
    try {
      const { name, email } = recipient;

      // 0. Find or create user for the recipient
      let user = await User.findOne({ email });
      let isNewUser = false;
      
      if (!user) {
        // Create a new credentialist user for this recipient
        const bcrypt = (await import('bcryptjs')).default;
        const defaultPassword = await bcrypt.hash('CredVerify@123', 10);
        
        // Generate username from name
        const username = name.toLowerCase().replace(/\s+/g, '_');
        
        user = await User.create({
          username: username,
          name: name, // Legal name - immutable
          email: email,
          passwordHash: defaultPassword,
          role: 'credentialist',
          isActive: true,
        });
        
        isNewUser = true;
        console.log(`✅ Created new user account for: ${email} with username: ${username}`);
      }
      
      const credential = await Credential.create({
        user: user._id,
        legalNameSnapshot: name,
        certificateName: name,
        nameMatchConfidence: 100,
        title: credentialName,
        type: 'micro_credential',
        issuer: 'WEV DEV LOPED BY TO BOOT CAMP',
        issueDate: new Date(issueDate),
        totalHours: parseInt(hours),
        nsqfLevel: parseInt(nsqfLevel),
        status: 'verified',
        verifiedBy: validantId,
        verifiedAt: new Date(),
        isPublic: false,
        isDomainTrusted: true,
        isIssuerVerified: true,
        skills: [],
        description: `Issued via bulk credential issuance on ${new Date().toLocaleDateString()}`,
      });

      const certificateId = credential._id.toString();

      // 1. Generate PDF certificate with verification ID
      const pdfBuffer = await generateCertificatePDF({
        recipientName: name,
        credentialName,
        issueDate,
        hours,
        nsqfLevel,
        instructorName,
        certificateId,
      });

      // Save PDF to local directory as backup
      const filename = `${credentialName.replace(/[^a-z0-9]/gi, '_')}_${name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
      const filepath = path.join(certsDir, filename);
      await fs.writeFile(filepath, pdfBuffer);

      // 2. Send email with PDF attachment
      let emailSent = false;
      let emailError = null;
      
      try {
        console.log(`📧 Attempting to send email to: ${email}`);
        console.log(`📧 PDF buffer size: ${pdfBuffer.length} bytes`);
        
        const emailResult = await sendCredentialEmail({
          to: email,
          recipientName: name,
          credentialName,
          pdfBuffer,
        });
        
        console.log(`✅ Email sent successfully to ${email}`);
        console.log(`✅ Email result:`, emailResult);
        emailSent = true;
      } catch (err) {
        console.error(`❌ Email failed to ${email}`);
        console.error(`❌ Error code: ${err.code}`);
        console.error(`❌ Error message: ${err.message}`);
        console.error(`❌ Full error:`, err);
        emailError = err;
      }

      // 3. Update credential with PDF path
      credential.pdfPath = filepath;
      await credential.save();

      // Add to results with email status
      const resultEntry = {
        name,
        email,
        status: emailSent ? 'sent' : 'pdf_only',
        pdfPath: filepath,
        certificateId,
        verificationUrl: `https://credverify.vercel.app/verify/${certificateId}`,
        isNewUser, // Flag to indicate if a new account was created
      };
      
      if (!emailSent && emailError) {
        resultEntry.emailError = emailError.message;
        resultEntry.note = 'PDF generated and saved locally, but email failed to send';
      }
      
      if (isNewUser) {
        resultEntry.accountCreated = true;
        resultEntry.defaultPassword = 'CredVerify@123';
      }

      results.successful.push(resultEntry);

    } catch (error) {
      results.failed.push({
        name: recipient.name,
        email: recipient.email,
        error: error.message,
      });
    }
  }

  return results;
};
