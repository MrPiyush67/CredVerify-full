import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { AppError } from '../../core/errors/AppError.js';
import * as credentialService from './services/credential.service.js';
import * as bulkCredentialService from './services/bulkCredential.service.js';
import * as externalCoursesService from './services/externalCourses.service.js';
import * as externalJobsService from './services/externalJobs.service.js';

// @desc    Upload a credential
// @route   POST /api/credentials
// @access  Private (Learner only)
export const uploadCredential = asyncHandler(async (req, res) => {
  const credential = await credentialService.createCredential(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, { credential }, 'Credential uploaded successfully'));
});

// @desc    Get my credentials
// @route   GET /api/credentials
// @access  Private (Learner only)
export const getMyCredentials = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filters = status ? { status } : {};
  const credentials = await credentialService.getMyCredentials(req.user._id, filters);
  return res.status(200).json(new ApiResponse(200, { credentials }, 'Credentials fetched successfully'));
});

// @desc    Get credential by ID
// @route   GET /api/credentials/:id
// @access  Private
export const getCredentialById = asyncHandler(async (req, res) => {
  const credential = await credentialService.getCredentialById(
    req.params.id,
    req.user._id
  );
  return res.status(200).json(new ApiResponse(200, { credential }, 'Credential fetched successfully'));
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
  return res.status(200).json(new ApiResponse(200, { credential }, 'Credential updated successfully'));
});

// @desc    Create credential from extension
// @route   POST /api/credentials/from-extension
// @access  Private (Learner only)
export const createCredentialFromExtension = asyncHandler(async (req, res) => {
  const credential = await credentialService.createCredential(req.user._id, req.body);

  return res.status(201).json(new ApiResponse(201, { credential }, 'Credential saved successfully from extension'));
});

// @desc    Delete credential
// @route   DELETE /api/credentials/:id
// @access  Private (Learner only)
export const deleteCredential = asyncHandler(async (req, res) => {
  await credentialService.deleteCredential(req.user._id, req.params.id);
  return res.status(200).json(new ApiResponse(200, null, 'Credential deleted successfully'));
});

// @desc    Get verified credentials
// @route   GET /api/credentials/verified
// @access  Private (Learner only)
export const getVerifiedCredentials = asyncHandler(async (req, res) => {
  const credentials = await credentialService.getVerifiedCredentials(req.user._id);
  return res.status(200).json(new ApiResponse(200, {
    credentials,
  }, 'Verified credentials fetched successfully'));
});

// @desc    Get credential stats
// @route   GET /api/credentials/stats
// @access  Private (Learner only)
export const getCredentialStats = asyncHandler(async (req, res) => {
  const stats = await credentialService.getCredentialStats(req.user._id);
  return res.status(200).json(new ApiResponse(200, { stats }, 'Stats fetched successfully'));
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
  return res.status(200).json(new ApiResponse(200, { credentials }, 'Public credentials fetched successfully'));
});

import { generateCertificatePDF } from '../../core/utils/certificateGenerator.js';

// @desc    Preview credential certificate
// @route   POST /api/credentials/preview
// @access  Private (Regulator only)
export const previewCertificate = asyncHandler(async (req, res) => {
  const { credentialName, issueDate, hours, nsqfLevel, recipientName } = req.body;

  if (!credentialName || !issueDate || !hours || !nsqfLevel) {
    throw new AppError(400, 'Please provide all credential details for preview');
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
    throw new AppError(400, 'Invalid input. Credential data and recipients array required.');
  }

  // Issue credentials to all recipients
  const results = await bulkCredentialService.issueBulkCredentials(
    regulatorId,
    credentialData,
    recipients
  );

  return res.status(200).json(new ApiResponse(200, { results }, 'Bulk credential issuance completed'));
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

  return res.status(200).json(new ApiResponse(200, {
    courses: result.courses,
    pagination: result.pagination
  }, 'External courses fetched successfully'));
});

// @desc    Get course categories with counts
// @route   GET /api/credentials/course-categories
// @access  Public
export const getCourseCategories = asyncHandler(async (req, res) => {
  const categories = await externalCoursesService.getCourseCategoriesWithCounts();

  return res.status(200).json(new ApiResponse(200, { categories }, 'Course categories fetched successfully'));
});

// @desc    Get courses by category
// @route   GET /api/credentials/courses-by-category/:category
// @access  Public
export const getCoursesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const courses = await externalCoursesService.getCoursesByCategory(category);

  return res.status(200).json(new ApiResponse(200, {
    courses,
    category,
    count: courses.length
  }, `Courses in ${category} fetched successfully`));
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

    return res.status(200).json(new ApiResponse(200, {
      jobs: result,
      count: result.length,
      search,
    }, 'Jobs search completed'));
  } else if (sector) {
    // Fetch jobs for specific sector
    const jobs = await externalJobsService.fetchJobsForSector(sector, {
      limit: limit ? parseInt(limit) : 20,
      useMock: useMock === 'true',
    });

    return res.status(200).json(new ApiResponse(200, {
      jobs,
      sector,
      count: jobs.length,
    }, `Jobs for ${sector} fetched successfully`));
  } else {
    // Fetch jobs for all sectors
    result = await externalJobsService.fetchAllSectorJobs({
      limit: limit ? parseInt(limit) : 10,
      useMock: useMock === 'true',
    });

    return res.status(200).json(new ApiResponse(200, result, 'Jobs for all sectors fetched successfully'));
  }
});

// @desc    Get job sectors list
// @route   GET /api/credentials/job-sectors
// @access  Public
export const getJobSectors = asyncHandler(async (req, res) => {
  const sectors = externalJobsService.getAllSectors();

  return res.status(200).json(new ApiResponse(200, {
    sectors,
    count: sectors.length,
  }, 'Job sectors fetched successfully'));
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

  return res.status(200).json(new ApiResponse(200, {
    jobs,
    sector,
    count: jobs.length,
  }, `Jobs in ${sector} fetched successfully`));
});
