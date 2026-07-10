import mongoose from 'mongoose';
import Credential from '../credential.model.js';
import { createNotification } from '../../notification/notification.service.js';
import PlatformProfile from '../../platform/platform.model.js';
import { uploadCredentialFile } from '../../../utils/imagekit.js';

export const createCredential = async (userId, credentialData) => {
  console.log('🔵 [CREATE CREDENTIAL] Starting credential creation');
  console.log('📝 Credential data:', {
    title: credentialData.title,
    issuer: credentialData.issuer,
    hasFile: !!credentialData.fileBase64,
    fileName: credentialData.fileName,
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
      const base64Data = credentialData.fileBase64
        .replace(/^data:image\/[a-z]+;base64,/, '')
        .replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Upload to ImageKit
      const uploadResult = await uploadCredentialFile(buffer, {
        fileName: credentialData.fileName || `credential-${Date.now()}.jpg`,
        userName: credentialData.certificateName || 'unknown',
        issuer: credentialData.issuer || 'unknown',
        tags: ['credential', 'regulator-verification'],
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
  const { fileBase64, fileName, fileType, fileSize, ...cleanCredentialData } =
    credentialData;

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
    title: 'Credential Added Successfully',
    message: `Your "${credential.title}" credential has been added and verified.`,
    type: 'success',
    category: 'credential',
    metadata: {
      credentialId: credential._id,
      credentialTitle: credential.title,
    },
  });

  return credential;
};

export const getMyCredentials = async (userId, filters = {}) => {
  const query = { user: userId, ...filters };

  const credentials = await Credential.find(query).sort({ createdAt: -1 });

  return credentials;
};

export const getCredentialById = async (credentialId, userId = null) => {
  const credential = await Credential.findById(credentialId).populate(
    'user',
    'name username email avatar',
  );

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
    const hasDisallowedFields = attemptedFields.some(
      (field) => !allowedFields.includes(field),
    );

    console.log('[UPDATE VERIFIED CREDENTIAL]', {
      credentialId: credential._id,
      attemptedFields,
      hasDisallowedFields,
      updates,
    });

    if (hasDisallowedFields) {
      const disallowedFields = attemptedFields.filter(
        (field) => !allowedFields.includes(field),
      );
      throw new Error(
        `Cannot update verified credentials. Attempted to modify: ${disallowedFields.join(', ')}. Only visibility (isPublic) can be changed.`,
      );
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

export const getVerifiedCredentials = async (userId) => {
  const credentials = await Credential.find({
    user: userId,
    status: 'verified',
  }).sort({ createdAt: -1 });

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
    .sort({ createdAt: -1 });

  return credentials;
};
