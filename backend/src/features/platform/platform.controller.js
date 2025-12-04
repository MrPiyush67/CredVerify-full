import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../core/utils/response.js';
import * as platformService from './platform.service.js';

// @desc    Get user's platform profile
// @route   GET /api/platforms/profile
// @access  Private
export const getPlatformProfile = asyncHandler(async (req, res) => {
  const profile = await platformService.getPlatformProfile(req.user._id);
  return sendSuccess(res, 200, 'Platform profile fetched successfully', { profile });
});

// @desc    Submit platform handle
// @route   POST /api/platforms/:platform/submit
// @access  Private
export const submitHandle = asyncHandler(async (req, res) => {
  const { platform } = req.params;
  const { handle } = req.body;
  
  if (!handle) {
    return sendError(res, 400, 'Handle is required');
  }
  
  const profile = await platformService.submitPlatformHandle(req.user._id, platform, handle);
  return sendSuccess(res, 200, 'Handle submitted successfully', { profile });
});

// @desc    Request verification code
// @route   POST /api/platforms/:platform/request-verification
// @access  Private
export const requestVerification = asyncHandler(async (req, res) => {
  const { platform } = req.params;
  
  const result = await platformService.requestVerification(req.user._id, platform);
  
  if (result.verified) {
    return sendSuccess(res, 200, 'Platform verified automatically', { profile: result.profile });
  }
  
  return sendSuccess(res, 200, 'Verification code generated', {
    code: result.code,
    platform: result.platform,
    handle: result.handle,
    expiresAt: result.expiresAt,
    instructions: getVerificationInstructions(platform, result.handle, result.code),
  });
});

// @desc    Verify platform ownership
// @route   POST /api/platforms/:platform/verify
// @access  Private
export const verifyOwnership = asyncHandler(async (req, res) => {
  const { platform } = req.params;
  
  const profile = await platformService.verifyPlatformOwnership(req.user._id, platform);
  return sendSuccess(res, 200, 'Platform verified successfully', { profile });
});

// @desc    Refresh platform stats
// @route   POST /api/platforms/:platform/refresh
// @access  Private
export const refreshStats = asyncHandler(async (req, res) => {
  const { platform } = req.params;
  
  const profile = await platformService.refreshPlatformStats(req.user._id, platform);
  return sendSuccess(res, 200, 'Stats refreshed successfully', { profile });
});

// @desc    Remove platform
// @route   DELETE /api/platforms/:platform
// @access  Private
export const removePlatform = asyncHandler(async (req, res) => {
  const { platform } = req.params;
  
  const profile = await platformService.removePlatform(req.user._id, platform);
  return sendSuccess(res, 200, 'Platform removed successfully', { profile });
});

// Helper function to generate platform-specific instructions
function getVerificationInstructions(platform, handle, code) {
  const baseInstructions = {
    leetcode: {
      step1: `Go to https://leetcode.com/${handle}/`,
      step2: 'Click on "Edit" in your profile',
      step3: `Add this code to your "Name" or "About Me" section: ${code}`,
      step4: 'Save your profile',
      step5: 'Click the "Verify" button below',
      note: 'You can remove the code from your profile after verification',
    },
    geeksforgeeks: {
      step1: `Go to https://auth.geeksforgeeks.org/user/${handle}/`,
      step2: 'Edit your profile',
      step3: `Add this code to your "Name" or "About" section: ${code}`,
      step4: 'Save changes',
      step5: 'Click the "Verify" button',
      note: 'Code can be removed after verification',
    },
    codechef: {
      step1: `Go to https://www.codechef.com/users/${handle}`,
      step2: 'Edit your bio',
      step3: `Paste this code: ${code}`,
      step4: 'Save your profile',
      step5: 'Return here and verify',
      note: 'Remove the code after verification if desired',
    },
    github: {
      step1: 'Go to https://github.com/settings/profile',
      step2: 'Find the "Bio" section',
      step3: `Add this verification code: ${code}`,
      step4: 'Save your profile',
      step5: 'Click "Verify" below',
      note: 'You can remove the code from your bio after verification',
    },
    hackerrank: {
      step1: `Go to https://www.hackerrank.com/${handle}`,
      step2: 'Edit your profile',
      step3: `Add code to your "About" section: ${code}`,
      step4: 'Save changes',
      step5: 'Verify here',
      note: 'Code can be removed post-verification',
    },
    atcoder: {
      step1: `Visit https://atcoder.jp/users/${handle}`,
      step2: 'Edit your profile',
      step3: `Add this code to your "Affiliation" field: ${code}`,
      step4: 'Save',
      step5: 'Return and verify',
      note: 'Optional to keep the code',
    },
    codeforces: {
      step1: 'Go to https://codeforces.com/settings/social',
      step2: 'Edit your profile settings',
      step3: `Add this code to your "First Name", "Last Name", or "Organization" field: ${code}`,
      step4: 'Save changes',
      step5: 'Click the "Verify" button below',
      note: 'You can remove the code after verification',
    },
  };
  
  return baseInstructions[platform] || {
    step1: 'Go to your profile page',
    step2: 'Edit your bio/description',
    step3: `Add this code: ${code}`,
    step4: 'Save',
    step5: 'Verify here',
  };
}
