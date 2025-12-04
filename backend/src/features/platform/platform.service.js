import PlatformProfile from './platform.model.js';
import { platformVerifiers, generateCode } from './platform.verifiers.js';
import Credential from '../credential/credential.model.js';
import { createNotification } from '../notification/notification.service.js';
import User from '../user/user.model.js';

// Get or create platform profile for a user
export const getPlatformProfile = async (userId) => {
  let profile = await PlatformProfile.findOne({ user: userId });
  
  if (!profile) {
    profile = await PlatformProfile.create({ user: userId });
  }
  
  return profile;
};

// Submit platform handle (without verification)
export const submitPlatformHandle = async (userId, platform, handle) => {
  const profile = await getPlatformProfile(userId);
  
  if (!profile[platform]) {
    throw new Error(`Platform ${platform} not supported`);
  }
  
  // Update handle and reset verification
  profile[platform].handle = handle;
  profile[platform].isVerified = false;
  profile[platform].verificationCode = null;
  profile[platform].verificationExpiry = null;
  
  await profile.save();
  return profile;
};

// Request verification code
export const requestVerification = async (userId, platform) => {
  const profile = await getPlatformProfile(userId);
  
  if (!profile[platform]) {
    throw new Error(`Platform ${platform} not supported`);
  }
  
  if (!profile[platform].handle) {
    throw new Error('Please submit your handle first');
  }
  
  // Codeforces doesn't need verification code (uses API directly)
  if (platform === 'codeforces') {
    const result = await platformVerifiers.codeforces(profile[platform].handle);
    if (result.success) {
      profile[platform].isVerified = true;
      profile[platform].stats = result.stats;
      profile[platform].lastFetched = new Date();
      await profile.save();
      return { verified: true, profile };
    }
    throw new Error(result.message);
  }
  
  // Generate verification code
  const code = profile.generateVerificationCode(platform);
  await profile.save();
  
  return {
    verified: false,
    code,
    platform,
    handle: profile[platform].handle,
    expiresAt: profile[platform].verificationExpiry,
  };
};

// Verify platform ownership
export const verifyPlatformOwnership = async (userId, platform) => {
  const profile = await getPlatformProfile(userId);
  
  if (!profile[platform]) {
    throw new Error(`Platform ${platform} not supported`);
  }
  
  if (!profile[platform].handle) {
    throw new Error('Handle not found');
  }
  
  if (!profile.isVerificationValid(platform)) {
    throw new Error('Verification code expired. Please request a new one');
  }
  
  // Call appropriate verifier
  const verifier = platformVerifiers[platform];
  if (!verifier) {
    throw new Error(`Verifier not implemented for ${platform}`);
  }
  
  let result;
  try {
    result = await verifier(
      profile[platform].handle,
      profile[platform].verificationCode
    );
  } catch (error) {
    console.error(`[Service] Error calling ${platform} verifier:`, error);
    throw new Error(`Verification failed: ${error.message}`);
  }
  
  if (!result.success) {
    console.error(`[Service] ${platform} verification failed:`, result.message);
    throw new Error(result.message);
  }
  
  // Platform names for notifications
  const platformNames = {
    leetcode: 'LeetCode',
    codeforces: 'CodeForces',
    codechef: 'CodeChef',
    atcoder: 'AtCoder',
    hackerrank: 'HackerRank',
    geeksforgeeks: 'GeeksForGeeks',
    github: 'GitHub',
    gitlab: 'GitLab',
    bitbucket: 'Bitbucket',
  };
  
  // Update profile with verification and stats - IMMEDIATELY VERIFIED
  profile[platform].isVerified = true; // Set to true immediately when code is found
  profile[platform].stats = result.stats || {};
  profile[platform].lastFetched = new Date();
  profile[platform].verificationCode = null; // Clear code after successful verification
  profile[platform].verificationExpiry = null;
  profile[platform].pendingValidation = false; // No need for validant approval
  
  await profile.save();
  
  // Notify user of successful verification
  await createNotification({
    user: userId,
    title: '✅ Platform Verified!',
    message: `Your ${platformNames[platform] || platform} profile has been verified successfully.`,
    type: 'success',
    category: 'verification',
    metadata: {
      platform,
      handle: profile[platform].handle,
      stats: result.stats || {},
    },
  });
  
  return profile;
};

// Refresh platform stats (for already verified platforms)
export const refreshPlatformStats = async (userId, platform) => {
  const profile = await getPlatformProfile(userId);
  
  if (!profile[platform] || !profile[platform].isVerified) {
    throw new Error('Platform not verified');
  }
  
  const verifier = platformVerifiers[platform];
  if (!verifier) {
    throw new Error(`Verifier not implemented for ${platform}`);
  }
  
  // For Codeforces, no verification code needed
  const result = platform === 'codeforces'
    ? await verifier(profile[platform].handle)
    : await verifier(profile[platform].handle, null);
  
  if (result.success && result.stats) {
    profile[platform].stats = result.stats;
    profile[platform].lastFetched = new Date();
    await profile.save();
  }
  
  return profile;
};

// Remove platform
export const removePlatform = async (userId, platform) => {
  const profile = await getPlatformProfile(userId);
  
  if (!profile[platform]) {
    throw new Error(`Platform ${platform} not supported`);
  }
  
  // Reset platform data
  profile[platform] = {
    handle: null,
    isVerified: false,
    verificationCode: null,
    verificationExpiry: null,
    stats: {},
  };
  
  await profile.save();
  return profile;
};
