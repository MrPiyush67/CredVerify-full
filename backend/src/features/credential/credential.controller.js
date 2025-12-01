import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { sendSuccess } from '../../core/utils/response.js';
import { MESSAGES } from '../../core/constants/messages.js';
import * as credentialService from './credential.service.js';
import * as bulkCredentialService from './bulkCredential.service.js';

// @desc    Upload a credential
// @route   POST /api/credentials
// @access  Private (Credentialist only)
export const uploadCredential = asyncHandler(async (req, res) => {
  const credential = await credentialService.createCredential(req.user._id, req.body);
  return sendSuccess(res, 201, MESSAGES.CREDENTIAL.UPLOADED, { credential });
});

// @desc    Get my credentials
// @route   GET /api/credentials
// @access  Private (Credentialist only)
export const getMyCredentials = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filters = status ? { status } : {};
  const credentials = await credentialService.getMyCredentials(req.user._id, filters);
  return sendSuccess(res, 200, 'Credentials fetched successfully', { credentials });
});

// @desc    Get credential by ID
// @route   GET /api/credentials/:id
// @access  Private
export const getCredentialById = asyncHandler(async (req, res) => {
  const credential = await credentialService.getCredentialById(
    req.params.id,
    req.user._id
  );
  return sendSuccess(res, 200, 'Credential fetched successfully', { credential });
});

// @desc    Update credential
// @route   PATCH /api/credentials/:id
// @access  Private (Credentialist only)
export const updateCredential = asyncHandler(async (req, res) => {
  const credential = await credentialService.updateCredential(
    req.user._id,
    req.params.id,
    req.body
  );
  return sendSuccess(res, 200, 'Credential updated successfully', { credential });
});

// @desc    Create credential from extension
// @route   POST /api/credentials/from-extension
// @access  Private (Credentialist only)
export const createCredentialFromExtension = asyncHandler(async (req, res) => {
  const credential = await credentialService.createCredential(req.user._id, req.body);

  return sendSuccess(res, 201, 'Credential saved successfully from extension', { credential });
});

// @desc    Delete credential
// @route   DELETE /api/credentials/:id
// @access  Private (Credentialist only)
export const deleteCredential = asyncHandler(async (req, res) => {
  await credentialService.deleteCredential(req.user._id, req.params.id);
  return sendSuccess(res, 200, 'Credential deleted successfully');
});

// @desc    Request verification for a credential
// @route   POST /api/credentials/:id/request-verification
// @access  Private (Credentialist only)
export const requestVerification = asyncHandler(async (req, res) => {
  const credential = await credentialService.requestVerification(
    req.user._id,
    req.params.id
  );
  return sendSuccess(res, 200, MESSAGES.CREDENTIAL.VERIFICATION_REQUESTED, {
    credential,
  });
});

// @desc    Get verified credentials
// @route   GET /api/credentials/verified
// @access  Private (Credentialist only)
export const getVerifiedCredentials = asyncHandler(async (req, res) => {
  const credentials = await credentialService.getVerifiedCredentials(req.user._id);
  return sendSuccess(res, 200, 'Verified credentials fetched successfully', {
    credentials,
  });
});

// @desc    Get credential stats
// @route   GET /api/credentials/stats
// @access  Private (Credentialist only)
export const getCredentialStats = asyncHandler(async (req, res) => {
  const stats = await credentialService.getCredentialStats(req.user._id);
  return sendSuccess(res, 200, 'Stats fetched successfully', { stats });
});

// @desc    Get all public credentials (browse/search)
// @route   GET /api/credentials/public
// @access  Public
export const getPublicCredentials = asyncHandler(async (req, res) => {
  const { credentialType, issuer, skills } = req.query;
  const filters = {};

  if (credentialType) filters.credentialType = credentialType;
  if (issuer) filters.issuer = issuer;
  if (skills) filters.skills = skills.split(',');

  const credentials = await credentialService.getPublicCredentials(filters);
  return sendSuccess(res, 200, 'Public credentials fetched successfully', { credentials });
});

// @desc    Get pending credentials for validant review
// @route   GET /api/credentials/pending
// @access  Private (Validant only)
export const getPendingCredentials = asyncHandler(async (req, res) => {
  const { credentialType, issuer, status, statusIn } = req.query;
  const filters = {};

  if (credentialType) filters.credentialType = credentialType;
  if (issuer) filters.issuer = issuer;
  if (status) filters.status = status;
  if (statusIn) filters.statusIn = statusIn;

  const credentials = await credentialService.getPendingCredentialsForValidant(filters);
  return sendSuccess(res, 200, 'Credentials fetched successfully', { credentials });
});

// @desc    Verify a credential (validant action)
// @route   POST /api/credentials/:id/verify
// @access  Private (Validant only)
export const verifyCredential = asyncHandler(async (req, res) => {
  const { verificationNotes } = req.body;
  const credential = await credentialService.verifyCredential(
    req.user._id,
    req.params.id,
    verificationNotes
  );
  return sendSuccess(res, 200, MESSAGES.CREDENTIAL.VERIFIED, { credential });
});

// @desc    Reject a credential (validant action)
// @route   POST /api/credentials/:id/reject
// @access  Private (Validant only)
export const rejectCredential = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  const credential = await credentialService.rejectCredential(
    req.user._id,
    req.params.id,
    rejectionReason
  );
  return sendSuccess(res, 200, MESSAGES.CREDENTIAL.REJECTED, { credential });
});

import { generateCertificatePDF } from '../../core/utils/certificateGenerator.js';

// @desc    Preview credential certificate
// @route   POST /api/credentials/preview
// @access  Private (Validant only)
export const previewCertificate = asyncHandler(async (req, res) => {
  const { credentialName, issueDate, hours, nsqfLevel, recipientName } = req.body;

  if (!credentialName || !issueDate || !hours || !nsqfLevel) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all credential details for preview',
    });
  }

  const pdfBuffer = await generateCertificatePDF({
    recipientName: recipientName || 'John Doe', // Default name for preview
    credentialName,
    issueDate,
    hours,
    nsqfLevel,
  });

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': pdfBuffer.length,
    'Content-Disposition': `inline; filename="preview.pdf"`,
  });

  res.send(pdfBuffer);
});

// @desc    Issue bulk credentials to multiple recipients
// @route   POST /api/credentials/bulk-issue
// @access  Private (Validant only)
export const issueBulkCredentials = asyncHandler(async (req, res) => {
  const { credentialData, recipients } = req.body;
  const validantId = req.user._id;
  
  // Validate input
  if (!credentialData || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input. Credential data and recipients array required.',
    });
  }

  // Issue credentials to all recipients
  const results = await bulkCredentialService.issueBulkCredentials(
    validantId,
    credentialData,
    recipients
  );

  return sendSuccess(res, 200, 'Bulk credential issuance completed', { results });
});
