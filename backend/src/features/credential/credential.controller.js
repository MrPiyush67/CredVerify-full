import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { sendSuccess } from '../../core/utils/response.js';
import { MESSAGES } from '../../core/constants/messages.js';
import * as credentialService from './services/credential.service.js';
import * as bulkCredentialService from './services/bulkCredential.service.js';
import * as externalCoursesService from './services/externalCourses.service.js';
import * as externalJobsService from './services/externalJobs.service.js';

// @desc    Upload a credential
// @route   POST /api/credentials
// @access  Private (Learner only)
export const uploadCredential = asyncHandler(async (req, res) => {
  const credential = await credentialService.createCredential(req.user._id, req.body);
  return sendSuccess(res, 201, MESSAGES.CREDENTIAL.UPLOADED, { credential });
});

// @desc    Get my credentials
// @route   GET /api/credentials
// @access  Private (Learner only)
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
// @access  Private (Learner only)
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
// @access  Private (Learner only)
export const createCredentialFromExtension = asyncHandler(async (req, res) => {
  const credential = await credentialService.createCredential(req.user._id, req.body);

  return sendSuccess(res, 201, 'Credential saved successfully from extension', { credential });
});

// @desc    Delete credential
// @route   DELETE /api/credentials/:id
// @access  Private (Learner only)
export const deleteCredential = asyncHandler(async (req, res) => {
  await credentialService.deleteCredential(req.user._id, req.params.id);
  return sendSuccess(res, 200, 'Credential deleted successfully');
});

// @desc    Request verification for a credential
// @route   POST /api/credentials/:id/request-verification
// @access  Private (Learner only)
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
// @access  Private (Learner only)
export const getVerifiedCredentials = asyncHandler(async (req, res) => {
  const credentials = await credentialService.getVerifiedCredentials(req.user._id);
  return sendSuccess(res, 200, 'Verified credentials fetched successfully', {
    credentials,
  });
});

// @desc    Get credential stats
// @route   GET /api/credentials/stats
// @access  Private (Learner only)
export const getCredentialStats = asyncHandler(async (req, res) => {
  const stats = await credentialService.getCredentialStats(req.user._id);
  return sendSuccess(res, 200, 'Stats fetched successfully', { stats });
});

// @desc    Get all public credentials (browse/search)
// @route   GET /api/credentials/public
// @access  Public
export const getPublicCredentials = asyncHandler(async (req, res) => {
  const { type, issuer, skills } = req.query;
  const filters = {};

  if (type) filters.type = type;
  if (issuer) filters.issuer = issuer;
  if (skills) filters.skills = skills.split(',');

  const credentials = await credentialService.getPublicCredentials(filters);
  return sendSuccess(res, 200, 'Public credentials fetched successfully', { credentials });
});

// @desc    Get pending credentials for regulator review
// @route   GET /api/credentials/pending
// @access  Private (Regulator only)
export const getPendingCredentials = asyncHandler(async (req, res) => {
  const { type, issuer, status, statusIn } = req.query;
  const filters = {};

  if (type) filters.type = type;
  if (issuer) filters.issuer = issuer;
  if (status) filters.status = status;
  if (statusIn) filters.statusIn = statusIn;

  const credentials = await credentialService.getPendingCredentialsForRegulator(filters);
  return sendSuccess(res, 200, 'Credentials fetched successfully', { credentials });
});

// @desc    Verify a credential (regulator action)
// @route   POST /api/credentials/:id/verify
// @access  Private (Regulator only)
export const verifyCredential = asyncHandler(async (req, res) => {
  const { verificationNotes } = req.body;
  const credential = await credentialService.verifyCredential(
    req.user._id,
    req.params.id,
    verificationNotes
  );
  return sendSuccess(res, 200, MESSAGES.CREDENTIAL.VERIFIED, { credential });
});

// @desc    Reject a credential (regulator action)
// @route   POST /api/credentials/:id/reject
// @access  Private (Regulator only)
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
// @access  Private (Regulator only)
export const previewCertificate = asyncHandler(async (req, res) => {
  const { credentialName, issueDate, hours, nsqfLevel, recipientName } = req.body;

  if (!credentialName || !issueDate || !hours || !nsqfLevel) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all credential details for preview',
    });
  }

  // Get regulator name for instructor field
  const instructorName = req.user.name || 'Admin';

  // Generate a dummy certificate ID for preview (not saved to database)
  const mongoose = (await import('mongoose')).default;
  const dummyCertificateId = new mongoose.Types.ObjectId().toString();

  const pdfBuffer = await generateCertificatePDF({
    recipientName: recipientName || 'John Doe', // Default name for preview
    credentialName,
    issueDate,
    hours,
    nsqfLevel,
    instructorName,
    certificateId: dummyCertificateId,
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
// @access  Private (Regulator only)
export const issueBulkCredentials = asyncHandler(async (req, res) => {
  const { credentialData, recipients } = req.body;
  const regulatorId = req.user._id;

  // Validate input
  if (!credentialData || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input. Credential data and recipients array required.',
    });
  }

  // Issue credentials to all recipients
  const results = await bulkCredentialService.issueBulkCredentials(
    regulatorId,
    credentialData,
    recipients
  );

  return sendSuccess(res, 200, 'Bulk credential issuance completed', { results });
});

// @desc    Get external courses from all platforms with pagination
// @route   GET /api/credentials/external-courses
// @access  Public
export const getExternalCourses = asyncHandler(async (req, res) => {
  const { query, platform, category, nsqfLevel, minHours, maxHours, page, limit } = req.query;

  const filters = {};
  if (platform) filters.platform = platform;
  if (category) filters.category = category;
  if (nsqfLevel) filters.nsqfLevel = nsqfLevel;
  if (minHours) filters.minHours = minHours;
  if (maxHours) filters.maxHours = maxHours;

  const pagination = {
    page: page || 1,
    limit: limit || 36, // Default 36 courses per page
  };

  const result = await externalCoursesService.searchExternalCourses(query || '', filters, pagination);

  return sendSuccess(res, 200, 'External courses fetched successfully', {
    courses: result.courses,
    pagination: result.pagination
  });
});

// @desc    Get course categories with counts
// @route   GET /api/credentials/course-categories
// @access  Public
export const getCourseCategories = asyncHandler(async (req, res) => {
  const categories = await externalCoursesService.getCourseCategoriesWithCounts();

  return sendSuccess(res, 200, 'Course categories fetched successfully', { categories });
});

// @desc    Get courses by category
// @route   GET /api/credentials/courses-by-category/:category
// @access  Public
export const getCoursesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const courses = await externalCoursesService.getCoursesByCategory(category);

  return sendSuccess(res, 200, `Courses in ${category} fetched successfully`, {
    courses,
    category,
    count: courses.length
  });
});

// ==================== JOB ENDPOINTS ====================

// @desc    Get external jobs from all sectors
// @route   GET /api/credentials/external-jobs
// @access  Public
export const getExternalJobs = asyncHandler(async (req, res) => {
  const { sector, search, limit, useMock } = req.query;

  let result;

  if (search) {
    // Search across all sectors
    result = await externalJobsService.searchJobs(search, {
      limit: limit ? parseInt(limit) : 20,
    });

    return sendSuccess(res, 200, 'Jobs search completed', {
      jobs: result,
      count: result.length,
      search,
    });
  } else if (sector) {
    // Fetch jobs for specific sector
    const jobs = await externalJobsService.fetchJobsForSector(sector, {
      limit: limit ? parseInt(limit) : 20,
      useMock: useMock === 'true',
    });

    return sendSuccess(res, 200, `Jobs for ${sector} fetched successfully`, {
      jobs,
      sector,
      count: jobs.length,
    });
  } else {
    // Fetch jobs for all sectors
    result = await externalJobsService.fetchAllSectorJobs({
      limit: limit ? parseInt(limit) : 10,
      useMock: useMock === 'true',
    });

    return sendSuccess(res, 200, 'Jobs for all sectors fetched successfully', result);
  }
});

// @desc    Get job sectors list
// @route   GET /api/credentials/job-sectors
// @access  Public
export const getJobSectors = asyncHandler(async (req, res) => {
  const sectors = externalJobsService.getAllSectors();

  return sendSuccess(res, 200, 'Job sectors fetched successfully', {
    sectors,
    count: sectors.length,
  });
});

// @desc    Get jobs by sector
// @route   GET /api/credentials/jobs-by-sector/:sector
// @access  Public
export const getJobsBySector = asyncHandler(async (req, res) => {
  const { sector } = req.params;
  const { limit, useMock } = req.query;

  const jobs = await externalJobsService.fetchJobsForSector(sector, {
    limit: limit ? parseInt(limit) : 20,
    useMock: useMock === 'true',
  });

  return sendSuccess(res, 200, `Jobs in ${sector} fetched successfully`, {
    jobs,
    sector,
    count: jobs.length,
  });
});
