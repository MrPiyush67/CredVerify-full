import PlatformProfile from './platform.model.js';
import { platformVerifiers, generateCode } from './platform.verifiers.js';
import Credential from '../credential/credential.model.js';
import { createNotification } from '../notification/notification.service.js';
import User from '../user/user.model.js';
import { AppError } from '../../core/errors/AppError.js';

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
    throw new AppError(400, `Platform ${platform} not supported`);
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
    throw new AppError(400, `Platform ${platform} not supported`);
  }
  
  if (!profile[platform].handle) {
    throw new AppError(400, 'Please submit your handle first');
  }
  
  // Generate verification code
  const code = profile.generateVerificationCode(platform);
  await profile.save();
  
  console.log(`[Service] ========== CODE GENERATION ==========`);
  console.log(`[Service] Platform: ${platform}`);
  console.log(`[Service] Generated Code: "${code}"`);
  console.log(`[Service] Saved to DB: "${profile[platform].verificationCode}"`);
  console.log(`[Service] Code Match: ${code === profile[platform].verificationCode}`);
  console.log(`[Service] =========================================`);
  
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
    throw new AppError(400, `Platform ${platform} not supported`);
  }
  
  if (!profile[platform].handle) {
    throw new AppError(400, 'Handle not found. Please submit your handle first');
  }
  
  // For Codeforces, auto-generate verification code if not present (API-based verification)
  if (platform === 'codeforces' && !profile[platform].verificationCode) {
    console.log('[Service] Auto-generating verification code for Codeforces');
    const autoCode = profile.generateVerificationCode(platform);
    await profile.save();
    console.log(`[Service] Auto-generated code: "${autoCode}"`);
    console.log(`[Service] Stored in DB: "${profile[platform].verificationCode}"`);
  }
  
  console.log(`[Service] ========== VERIFICATION ATTEMPT ==========`);
  console.log(`[Service] Platform: ${platform}`);
  console.log(`[Service] Handle: ${profile[platform].handle}`);
  console.log(`[Service] Code from DB: "${profile[platform].verificationCode}"`);
  console.log(`[Service] Code Type: ${typeof profile[platform].verificationCode}`);
  console.log(`[Service] Code Length: ${profile[platform].verificationCode?.length}`);
  console.log(`[Service] ==========================================`);
  
  if (!profile[platform].verificationCode) {
    throw new AppError(400, 'No verification code found. Please request a verification code first');
  }
  
  if (!profile.isVerificationValid(platform)) {
    throw new AppError(400, 'Verification code expired. Please request a new one');
  }
  
  // Call appropriate verifier
  const verifier = platformVerifiers[platform];
  if (!verifier) {
    throw new AppError(501, `Verifier not implemented for ${platform}`);
  }
  
  let result;
  try {
    result = await verifier(
      profile[platform].handle,
      profile[platform].verificationCode
    );
  } catch (error) {
    console.error(`[Service] Error calling ${platform} verifier:`, error);
    throw new AppError(502, `Verification failed: ${error.message}`);
  }
  
  if (!result.success) {
    console.error(`[Service] ${platform} verification failed:`, result.message);
    throw new AppError(400, result.message);
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
  profile[platform].isVerified = true;
  profile[platform].stats = result.stats || {};
  profile[platform].lastFetched = new Date();
  profile[platform].verificationCode = null; // Clear code after successful verification
  profile[platform].verificationExpiry = null;
  profile[platform].pendingValidation = false;
  
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
    throw new AppError(400, 'Platform not verified');
  }
  
  const verifier = platformVerifiers[platform];
  if (!verifier) {
    throw new AppError(501, `Verifier not implemented for ${platform}`);
  }
  
  // Refresh stats without verification code (pass null for code parameter)
  const result = await verifier(profile[platform].handle, null);
  
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
    throw new AppError(400, `Platform ${platform} not supported`);
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
