import mongoose from 'mongoose';
import Credential from '../credential.model.js';
import { createNotification } from '../../notification/notification.service.js';
import PlatformProfile from '../../platform/platform.model.js';
import { uploadCredentialFile } from '../../../core/utils/imagekitService.js';

export const createCredential = async (userId, credentialData) => {
  console.log('🔵 [CREATE CREDENTIAL] Starting credential creation');
  console.log('📝 Credential data:', {
    title: credentialData.title,
    issuer: credentialData.issuer,
    hasFile: !!credentialData.fileBase64,
    fileName: credentialData.fileName
  });

  // Validate required fields
  if (!credentialData.title) {
    console.error('❌ Missing title');
    throw new Error('Credential title is required');
  }
  if (!credentialData.issuer) {
    console.error('❌ Missing issuer');
    throw new Error('Issuer is required');
  }
  if (!credentialData.issueDate) {
    console.error('❌ Missing issue date');
    throw new Error('Issue date is required');
  }
  if (!credentialData.legalNameSnapshot) {
    console.error('❌ Missing legal name snapshot');
    throw new Error('Legal name snapshot is required');
  }
  if (!credentialData.certificateName) {
    console.error('❌ Missing certificate name');
    throw new Error('Certificate name is required');
  }

  // Handle file upload if fileBase64 is provided
  let fileData = null;
  if (credentialData.fileBase64) {
    try {
      console.log('📤 [IMAGEKIT] Uploading file to ImageKit...');
      // Convert base64 to buffer
      const base64Data = credentialData.fileBase64.replace(/^data:image\/[a-z]+;base64,/, '').replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Upload to ImageKit
      const uploadResult = await uploadCredentialFile(buffer, {
        fileName: credentialData.fileName || `credential-${Date.now()}.jpg`,
        userName: credentialData.certificateName || 'unknown',
        issuer: credentialData.issuer || 'unknown',
        tags: ['credential', 'validant-verification'],
      });

      fileData = {
        url: uploadResult.url,
        fileName: uploadResult.fileName,
        fileType: credentialData.fileType || uploadResult.fileType,
        storageId: uploadResult.fileId,
        uploadedAt: new Date(),
      };

      console.log('✅ File uploaded to ImageKit:', uploadResult.url);
    } catch (uploadError) {
      console.error('❌ ImageKit upload failed:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }
  }

  // Remove fileBase64 and temporary fields from credential data
  const { fileBase64, fileName, fileType, fileSize, ...cleanCredentialData } = credentialData;

  // Add file data if uploaded
  if (fileData) {
    cleanCredentialData.file = fileData;
  }

  const credential = await Credential.create({
    user: userId,
    ...cleanCredentialData,
  });

  // Create notification for successful credential upload
  await createNotification({
    user: userId,
    title: 'Credential Submitted for Verification',
    message: `Your "${credential.title}" credential has been submitted and is pending verification.`,
    type: 'success',
    category: 'credential',
    metadata: {
      credentialId: credential._id,
      credentialTitle: credential.title,
    },
  });

  // If institution is specified, notify validants from that institution
  if (credential.institution) {
    try {
      console.log('🔔 [NOTIFICATION] Finding validants for institution:', credential.institution);
      const User = mongoose.model('User');
      const validants = await User.find({
        role: 'validant',
        institution: credential.institution,
      }).select('_id name email');

      console.log(`📧 [NOTIFICATION] Found ${validants.length} validants for ${credential.institution}`);

      // Send notification to each validant
      for (const validant of validants) {
        await createNotification({
          user: validant._id,
          title: 'New Credential Verification Request',
          message: `A new credential "${credential.title}" from ${credential.institution} requires verification.`,
          type: 'info',
          category: 'verification',
          metadata: {
            credentialId: credential._id,
            credentialTitle: credential.title,
            institution: credential.institution,
          },
        });
        console.log(`✅ [NOTIFICATION] Sent to validant: ${validant.name} (${validant.email})`);
      }
    } catch (notificationError) {
      console.error('❌ [NOTIFICATION] Failed to notify validants:', notificationError);
      // Don't throw error - credential was created successfully
    }
  }

  return credential;
};

export const getMyCredentials = async (userId, filters = {}) => {
  const query = { user: userId, ...filters };

  const credentials = await Credential.find(query)
    .populate('verifiedBy', 'name email')
    .sort({ createdAt: -1 });

  return credentials;
};

export const getCredentialById = async (credentialId, userId = null) => {
  const credential = await Credential.findById(credentialId)
    .populate('user', 'name username email avatar')
    .populate('verifiedBy', 'name email');

  if (!credential) {
    throw new Error('Credential not found');
  }

  // If userId provided, check if user is owner
  if (userId && credential.user._id.toString() !== userId.toString()) {
    // Only return if verified (for privacy)
    if (credential.status !== 'verified') {
      throw new Error('Unauthorized to view this credential');
    }
  }

  return credential;
};

export const updateCredential = async (userId, credentialId, updates) => {
  const credential = await Credential.findOne({
    _id: credentialId,
    user: userId,
  });

  if (!credential) {
    throw new Error('Credential not found or unauthorized');
  }

  // Allow only visibility (isPublic) updates for verified credentials
  // This enables users to control visibility of DigiLocker-imported credentials
  if (credential.status === 'verified') {
    const allowedFields = ['isPublic'];
    const attemptedFields = Object.keys(updates);
    const hasDisallowedFields = attemptedFields.some(field => !allowedFields.includes(field));
    
    console.log('[UPDATE VERIFIED CREDENTIAL]', {
      credentialId: credential._id,
      attemptedFields,
      hasDisallowedFields,
      updates
    });
    
    if (hasDisallowedFields) {
      const disallowedFields = attemptedFields.filter(field => !allowedFields.includes(field));
      throw new Error(`Cannot update verified credentials. Attempted to modify: ${disallowedFields.join(', ')}. Only visibility (isPublic) can be changed.`);
    }
  }

  Object.assign(credential, updates);
  await credential.save();

  return credential;
};

export const deleteCredential = async (userId, credentialId) => {
  const credential = await Credential.findOneAndDelete({
    _id: credentialId,
    user: userId,
  });

  if (!credential) {
    throw new Error('Credential not found or unauthorized');
  }

  return credential;
};

export const requestVerification = async (userId, credentialId) => {
  const credential = await Credential.findOne({
    _id: credentialId,
    user: userId,
  });

  if (!credential) {
    throw new Error('Credential not found or unauthorized');
  }

  if (credential.status === 'verified') {
    throw new Error('Credential is already verified');
  }

  if (credential.verificationRequested && credential.status === 'pending') {
    throw new Error('Verification already requested');
  }

  // Allow verification request if:
  // 1. File is uploaded, OR
  // 2. Credential has external source (DigiLocker, etc.) with sourceUrl
  const hasFile = credential.file && credential.file.url;
  const hasExternalSource = credential.sourceUrl && credential.sourceDomain;
  if (!hasFile && !hasExternalSource) {
    throw new Error('Please upload credential file or connect from verified source (DigiLocker) before requesting verification');
  }

  credential.verificationRequested = true;
  credential.status = 'pending';
  credential.requestedAt = new Date();
  await credential.save();

  // Notify credentialist
  await createNotification({
    user: userId,
    title: 'Verification Requested',
    message: `Your verification request for "${credential.title}" has been sent to validants.`,
    type: 'info',
    category: 'verification',
    metadata: {
      credentialId: credential._id,
      credentialTitle: credential.title,
      requestedAt: credential.requestedAt,
    },
  });

  // TODO: Notify validants (can be enhanced to notify specific institution validants)
  // For now, validants will see it in their pending queue

  return credential;
};

export const getVerifiedCredentials = async (userId) => {
  const credentials = await Credential.find({
    user: userId,
    status: 'verified',
  }).sort({ verifiedAt: -1 });

  return credentials;
};

export const getCredentialStats = async (userId) => {
  const stats = await Credential.aggregate([
    { $match: { user: userId } },
    {
      $facet: {
        total: [{ $count: 'count' }],
        statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
      },
    },
  ]);

  const total = stats[0].total[0]?.count || 0;
  const statusCounts = stats[0].statusCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return {
    total,
    verified: statusCounts.verified || 0,
    pending: statusCounts.pending || 0,
    rejected: statusCounts.rejected || 0,
    draft: statusCounts.draft || 0,
  };
};

// Get all public credentials (for browse/search)
export const getPublicCredentials = async (filters = {}) => {
  const query = { status: 'verified', isPublic: true };

  // Optional filters
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.issuer) {
    query.issuer = { $regex: filters.issuer, $options: 'i' };
  }
  if (filters.skills && filters.skills.length > 0) {
    query.skills = { $in: filters.skills };
  }

  const credentials = await Credential.find(query)
    .populate('user', 'name email avatar')
    .populate('verifiedBy', 'name email')
    .sort({ verifiedAt: -1 });

  return credentials;
};

// Get pending credentials for validant review
export const getPendingCredentialsForValidant = async (filters = {}) => {
  let query = {};

  // Handle multiple statuses (e.g., for past requests: verified OR rejected)
  if (filters.statusIn) {
    const statuses = filters.statusIn.split(',');
    query.status = { $in: statuses };
  } else if (filters.status) {
    query.status = filters.status;
  } else {
    // Default: only pending and requested for verification
    query.status = 'pending';
    query.verificationRequested = true;
  }

  // Optional filters
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.issuer) {
    query.issuer = { $regex: filters.issuer, $options: 'i' };
  }

  const credentials = await Credential.find(query)
    .populate('user', 'name email avatar')
    .populate('verifiedBy', 'name email')
    .sort({ requestedAt: -1, updatedAt: -1 }); // Most recent first

  return credentials;
};

// Verify credential (validant action)
export const verifyCredential = async (validantId, credentialId, verificationNotes = '') => {
  const credential = await Credential.findById(credentialId).populate(
    'user',
    'username name'
  );
  if (!credential) throw new Error('Credential not found');
  if (credential.status !== 'pending') throw new Error('Credential is not pending verification');

  credential.status = 'verified';
  credential.verifiedBy = validantId;
  credential.verifiedAt = new Date();
  if (verificationNotes) {
    credential.verificationNotes = verificationNotes;
  }

  await credential.save();

  // If this is a platform credential, mark the platform as verified
  if (credential.meta?.verificationType === 'platform_profile' && credential.meta?.platformId) {
    const platformProfile = await PlatformProfile.findOne({ user: credential.user._id });
    if (platformProfile && platformProfile[credential.meta.platformId]) {
      platformProfile[credential.meta.platformId].isVerified = true;
      platformProfile[credential.meta.platformId].pendingValidation = false;
      await platformProfile.save();
    }
  }

  // Notify credentialist of successful verification
  await createNotification({
    user: credential.user._id,
    title: '✅ Credential Verified!',
    message: `Your "${credential.title}" has been verified successfully.`,
    type: 'success',
    category: 'verification',
    metadata: {
      credentialId: credential._id,
      credentialTitle: credential.title,
      verifiedBy: validantId,
      verificationNotes: verificationNotes,
    },
  });

  return credential;
};

// Reject credential (validant action)
export const rejectCredential = async (validantId, credentialId, rejectionReason) => {
  const credential = await Credential.findById(credentialId).populate(
    'user',
    'username name'
  );
  if (!credential) throw new Error('Credential not found');
  if (credential.status !== 'pending') throw new Error('Credential is not pending verification');
  if (!rejectionReason) throw new Error('Rejection reason is required');

  credential.status = 'rejected';
  credential.verifiedBy = validantId;
  credential.rejectionReason = rejectionReason;
  credential.verificationRequested = false;

  await credential.save();

  // If this is a platform credential, mark the platform as rejected
  if (credential.meta?.verificationType === 'platform_profile' && credential.meta?.platformId) {
    const platformProfile = await PlatformProfile.findOne({ user: credential.user._id });
    if (platformProfile && platformProfile[credential.meta.platformId]) {
      platformProfile[credential.meta.platformId].isVerified = false;
      platformProfile[credential.meta.platformId].pendingValidation = false;
      platformProfile[credential.meta.platformId].handle = null; // Reset handle so user can try again
      await platformProfile.save();
    }
  }

  // Notify credentialist of rejection
  await createNotification({
    user: credential.user._id,
    title: '❌ Credential Rejected',
    message: `Your "${credential.title}" was rejected. Reason: ${rejectionReason}`,
    type: 'warning',
    category: 'verification',
    metadata: {
      credentialId: credential._id,
      credentialTitle: credential.title,
      rejectionReason: rejectionReason,
      verifiedBy: validantId,
    },
  });

  return credential;
};
