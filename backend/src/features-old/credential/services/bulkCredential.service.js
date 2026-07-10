/**
 * Bulk Credential Issuance Service
 *
 * Flow:
 * 1. Regulator opens issue credential page
 * 2. Adds user's legal name and email, generates credential
 * 3. Backend checks if learner account exists
 * 4. If not exists: creates account with default password (CredVerify@123)
 * 5. Generates PDF certificate with QR code and verification link
 * 6. Uploads PDF to IPFS (Pinata) - primary cloud storage
 * 7. Computes fingerprint from verification URL (keccak256 hash)
 * 8. Registers certificate on Ethereum Sepolia blockchain
 * 9. Saves credential to MongoDB with IPFS CID and blockchain txHash
 * 10. Sends email with PDF attachment (includes login credentials if new user)
 * 11. Saves local backup copy to backend/certificates folder
 *
 * Benefits:
 * - IPFS provides decentralized, permanent certificate storage
 * - Blockchain provides immutable proof of issuance
 * - Email delivers certificate directly to recipient
 * - Local backup ensures redundancy
 */

import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { generateCertificatePDF } from '../../../utils/certificateGenerator.js';
import { sendCredentialEmail } from '../../../utils/emailService.js';
import { uploadToIpfs } from '../../../utils/ipfsService.js';
import {
  computeFingerprintFromUrl,
  registerOnChain,
} from '../../../utils/blockchainService.js';
import Credential from '../credential.model.js';
import User from '../../user/models/user.model.js';
import { createNotification } from '../../notification/notification.service.js';

// Set up directory for certificate storage (backup only)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certsDir = path.join(__dirname, '../../../../certificates');

// Ensure certificates directory exists
await fs.mkdir(certsDir, { recursive: true }).catch(console.error);

/**
 * Issue bulk credentials to multiple recipients
 * @param {string} regulatorId - ID of the regulator issuing credentials
 * @param {Object} credentialData - Common credential data
 * @param {Array} recipients - Array of recipient objects {name, email}
 */
export const issueBulkCredentials = async (
  regulatorId,
  credentialData,
  recipients,
) => {
  const { credentialName, issueDate, hours, nsqfLevel } = credentialData;

  // Fetch regulator details for instructor name
  const regulator = await User.findById(regulatorId).select('name');
  const instructorName = regulator?.name || 'Admin';

  const results = {
    successful: [],
    failed: [],
  };

  // Process recipients in batches of 3 for better performance
  const BATCH_SIZE = 3;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    // Process batch in parallel
    const batchPromises = batch.map(async (recipient) => {
      try {
        const { name, email } = recipient;

        // 0. Find or create user for the recipient
        let user = await User.findOne({ email });
        let isNewUser = false;

        if (!user) {
          // Create a new learner user for this recipient
          const bcrypt = (await import('bcryptjs')).default;
          const defaultPassword = await bcrypt.hash('CredVerify@123', 10);

          // Generate username from name
          const username = name.toLowerCase().replace(/\s+/g, '_');

          user = await User.create({
            username: username,
            name: name, // Legal name - immutable
            email: email,
            passwordHash: defaultPassword,
            role: 'learner',
            isActive: true,
          });

          isNewUser = true;
          console.log(
            `✅ Created new user account for: ${email} with username: ${username}`,
          );
        }

        const credential = await Credential.create({
          user: user._id,
          legalNameSnapshot: name,
          certificateName: name,
          nameMatchConfidence: 100,
          verificationStatus: 'VERIFIED',
          finalVerificationScore: 100,
          autoApproved: true,
          title: credentialName,
          type: 'micro_credential',
          issuer: 'WEV DEV LOPED BY TO BOOT CAMP',
          issueDate: new Date(issueDate),
          totalHours: parseInt(hours),
          nsqfLevel: parseInt(nsqfLevel),
          status: 'verified',
          verifiedBy: regulatorId,
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

        // 2. Upload PDF to IPFS (primary storage)
        console.log(
          `📤 [BULK-ISSUE] Uploading certificate to IPFS for ${name}...`,
        );

        const filename = `${credentialName.replace(/[^a-z0-9]/gi, '_')}_${name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
        let ipfsResult = null;
        let chainResult = null;
        let ipfsUrl = null;

        try {
          // Upload to IPFS
          ipfsResult = await uploadToIpfs(pdfBuffer, filename);
          console.log(
            `✅ [BULK-ISSUE] IPFS upload successful: ${ipfsResult.cid}`,
          );

          ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsResult.cid}`;

          // Generate verification URL (will be used as source URL)
          const verificationUrl = `${process.env.CLIENT_URL || 'https://credverify.vercel.app'}/verify/${certificateId}`;

          // Compute fingerprint from verification URL
          const fingerprint = computeFingerprintFromUrl(verificationUrl);

          if (fingerprint && ipfsResult.cid) {
            console.log(`🔑 [BULK-ISSUE] Registering on blockchain...`);
            console.log(`   Verification URL: ${verificationUrl}`);
            console.log(`   Fingerprint: ${fingerprint}`);

            chainResult = await registerOnChain(fingerprint, ipfsResult.cid);
            console.log(
              `✅ [BULK-ISSUE] Blockchain registration successful: ${chainResult.txHash}`,
            );

            // Update credential with blockchain data
            credential.certificateFingerprint = fingerprint;
          }
        } catch (err) {
          console.error(
            `❌ [BULK-ISSUE] IPFS/Blockchain error for ${name}:`,
            err.message,
          );
          // Continue even if IPFS/blockchain fails - we still have the PDF locally
        }

        // 3. Update credential with IPFS and blockchain data
        if (ipfsResult) {
          credential.file = {
            url: ipfsUrl,
            fileName: filename,
            fileType: 'application/pdf',
            uploadedAt: new Date(),
            ipfs: {
              cid: ipfsResult.cid,
              provider: 'pinata',
            },
          };

          if (chainResult) {
            credential.file.blockchain = {
              txHash: chainResult.txHash,
            };
          }

          credential.sourceUrl = `${process.env.CLIENT_URL || 'https://credverify.vercel.app'}/verify/${certificateId}`;
          credential.sourceDomain = 'credverify.vercel.app';
        }

        // Save credential with updated data
        await credential.save();

        // 4. Save PDF to local directory as backup (optional)
        const filepath = path.join(certsDir, filename);
        await fs.writeFile(filepath, pdfBuffer);
        console.log(`💾 [BULK-ISSUE] Backup PDF saved locally: ${filepath}`);

        // 5. Send email with PDF attachment
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
            isNewUser,
            loginEmail: email,
            loginPassword: isNewUser ? 'CredVerify@123' : '',
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

        // 4. Create notification for the regulator (admin) about credential issuance
        try {
          await createNotification({
            user: regulatorId,
            title: 'Credential Issued',
            message: `Credential "${credentialName}" has been successfully issued to ${name}.`,
            type: 'success',
            category: 'credential',
            metadata: {
              credentialId: certificateId,
              recipientName: name,
              recipientEmail: email,
              credentialName,
            },
          });
        } catch (notifError) {
          console.error('Failed to create notification:', notifError.message);
          // Don't fail the whole process if notification fails
        }

        // Add to results with email status
        const resultEntry = {
          name,
          email,
          status: emailSent ? 'sent' : 'saved_without_email',
          certificateId,
          verificationUrl: `${process.env.CLIENT_URL || 'https://credverify.vercel.app'}/verify/${certificateId}`,
          isNewUser,
          ipfs: ipfsResult
            ? {
                cid: ipfsResult.cid,
                url: ipfsUrl,
              }
            : null,
          blockchain: chainResult
            ? {
                txHash: chainResult.txHash,
                explorerUrl: `https://sepolia.etherscan.io/tx/${chainResult.txHash}`,
              }
            : null,
          localBackup: filepath,
        };

        if (!emailSent && emailError) {
          resultEntry.emailError = emailError.message;
          resultEntry.note =
            'Certificate uploaded to IPFS and blockchain, but email failed to send';
        }

        if (isNewUser) {
          resultEntry.accountCreated = true;
          resultEntry.defaultPassword = 'CredVerify@123';
        }

        return { success: true, result: resultEntry };
      } catch (error) {
        return {
          success: false,
          result: {
            name: recipient.name,
            email: recipient.email,
            error: error.message,
          },
        };
      }
    });

    // Wait for batch to complete
    const batchResults = await Promise.all(batchPromises);

    // Categorize results
    batchResults.forEach(({ success, result }) => {
      if (success) {
        results.successful.push(result);
      } else {
        results.failed.push(result);
      }
    });

    console.log(
      `📊 Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(recipients.length / BATCH_SIZE)}`,
    );
  }

  return results;
};
