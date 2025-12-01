import Credential from './credential.model.js';
import { createNotification } from '../notification/notification.service.js';

export const createCredential = async (userId, credentialData) => {
  const credential = await Credential.create({
    user: userId,
    ...credentialData,
  });

  // Create notification for successful credential upload
  await createNotification({
    user: userId,
    title: 'Credential Uploaded Successfully',
    message: `Your "${credential.title}" credential has been saved as draft.`,
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

  const credentials = await Credential.find(query)
    .populate('verifiedBy', 'name email')
    .sort({ createdAt: -1 });

  return credentials;
};

export const getCredentialById = async (credentialId, userId = null) => {
  const credential = await Credential.findById(credentialId)
    .populate('user', 'name email avatar')
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

  // Don't allow updates if already verified
  if (credential.status === 'verified') {
    throw new Error('Cannot update verified credentials');
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

  // Must have file uploaded
  if (!credential.file || !credential.file.url) {
    throw new Error('Please upload credential file before requesting verification');
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
