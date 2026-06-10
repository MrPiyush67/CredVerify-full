import OrganizationCertificate from '../models/organizationCertificate.model.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { verifyOrganizationCertificate, validateCertificateData } from '../services/organizationVerification.service.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { AppError } from '../../../core/errors/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Submit a new certificate from random generator or bulk upload
 * POST /api/certificates/organization/submit
 */
export const submitCertificate = async (req, res) => {
  try {
    const { certificate } = req.body;

    // Validate required fields
    if (!certificate) {
      throw new AppError(400, 'Certificate data is required');
    }

    const {
      recipientName,
      certificateId,
      companyName,
      issuer,
      courseTitle,
      issueDate,
      duration,
      learningHours,
      nsqfLevel,
      skills,
      certificateImageBase64
    } = certificate;

    // Validate required fields
    if (!recipientName || !certificateId || !companyName || !issuer) {
      throw new AppError(400, 'Missing required fields: recipientName, certificateId, companyName, issuer');
    }

    // Check for duplicate certificate
    const fingerprintData = `${certificateId}-${companyName}`;
    const fingerprint = crypto.createHash('sha256').update(fingerprintData).digest('hex');

    const existingCert = await OrganizationCertificate.findOne({
      certificateFingerprint: fingerprint
    });

    if (existingCert) {
      throw new AppError(409, 'Certificate already exists');
    }

    // Save certificate image to local storage
    let imageData = null;
    if (certificateImageBase64) {
      try {
        // Create storage directory structure: YYYY/MM/company-name/
        const storageBasePath = process.env.ORGANIZATION_CERT_STORAGE_PATH ||
          path.join(__dirname, '../../../../storage/organization-certificates');

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const storagePath = path.join(storageBasePath, String(year), month, companySlug);

        // Ensure directory exists
        await fs.mkdir(storagePath, { recursive: true });

        // Parse base64 image
        const base64Data = certificateImageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Determine file extension
        let fileExt = 'png';
        let mimeType = 'image/png';
        if (certificateImageBase64.startsWith('data:image/jpeg') || certificateImageBase64.startsWith('data:image/jpg')) {
          fileExt = 'jpg';
          mimeType = 'image/jpeg';
        } else if (certificateImageBase64.startsWith('data:application/pdf')) {
          fileExt = 'pdf';
          mimeType = 'application/pdf';
        }

        // Generate filename
        const fileName = `${certificateId}.${fileExt}`;
        const filePath = path.join(storagePath, fileName);

        // Save file
        await fs.writeFile(filePath, imageBuffer);

        imageData = {
          localPath: filePath,
          fileName: fileName,
          fileType: mimeType
        };
      } catch (error) {
        console.error('[Submit Certificate] Error saving image:', error);
        // Continue without image - will be marked as pending for processing
      }
    }

    // Create OrganizationCertificate document
    const orgCertificate = new OrganizationCertificate({
      recipientName,
      certificateId,
      companyName,
      issuer,
      courseTitle,
      issueDate: issueDate ? new Date(issueDate) : null,
      duration,
      learningHours,
      nsqfLevel,
      skills,
      certificateImage: imageData,
      certificateFingerprint: fingerprint,
      processingStatus: 'pending',
      source: 'random_generator'
    });

    await orgCertificate.save();

    console.log(`[Submit Certificate] Created certificate ${certificateId} for ${companyName}`);

    return res.status(201).json(new ApiResponse(201, { certificateId: orgCertificate._id, status: 'pending_processing' }, 'Certificate submitted successfully'));

  } catch (error) {
    console.error('[Submit Certificate] Error:', error);
    throw new AppError(500, 'Failed to submit certificate');
  }
};

/**
 * Get pending certificates for watcher script processing
 * GET /api/certificates/organization/pending?limit=10
 */
export const getPendingCertificates = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const certificates = await OrganizationCertificate.getPendingForProcessing(limit);

    console.log(`[Get Pending] Returning ${certificates.length} pending certificates`);

    return res.status(200).json(new ApiResponse(200, { certificates, count: certificates.length }, 'Success'));

  } catch (error) {
    console.error('[Get Pending] Error:', error);
    throw new AppError(500, 'Failed to fetch pending certificates');
  }
};

/**
 * Process certificate - update after OCR/LLM extraction
 * PUT /api/certificates/organization/:id/process
 */
export const processCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { ocrText, extractedData, processingStatus } = req.body;

    // Find certificate
    const certificate = await OrganizationCertificate.findById(id);

    if (!certificate) {
      throw new AppError(404, 'Certificate not found');
    }

    // Update based on processing status
    if (processingStatus === 'processed' && ocrText && extractedData) {
      await certificate.markAsProcessed(ocrText, extractedData);

      console.log(`[Process Certificate] Marked ${id} as processed`);

      return res.status(200).json(new ApiResponse(200, { certificateId: certificate._id, status: certificate.processingStatus }, 'Certificate processed successfully'));

    } else if (processingStatus === 'failed') {
      const error = req.body.processingError || 'Unknown error';
      await certificate.markAsFailed(new Error(error));

      console.log(`[Process Certificate] Marked ${id} as failed: ${error}`);

      return res.status(200).json(new ApiResponse(200, { certificateId: certificate._id, status: certificate.processingStatus, error }, 'Certificate marked as failed'));

    } else {
      throw new AppError(400, 'Invalid processing data. Required: processingStatus, ocrText, extractedData');
    }

  } catch (error) {
    console.error('[Process Certificate] Error:', error);
    throw new AppError(500, 'Failed to process certificate');
  }
};

/**
 * Get list of companies with certificate counts
 * GET /api/certificates/organization/companies
 */
export const getCompanies = async (req, res) => {
  try {
    const companies = await OrganizationCertificate.getCompanyList();

    console.log(`[Get Companies] Returning ${companies.length} companies`);

    return res.status(200).json(new ApiResponse(200, { companies }, 'Success'));

  } catch (error) {
    console.error('[Get Companies] Error:', error);
    throw new AppError(500, 'Failed to fetch companies');
  }
};

/**
 * Verify user-uploaded certificate against organization database
 * POST /api/certificates/organization/verify
 */
export const verifyUserCertificate = async (req, res) => {
  try {
    const userId = req.user._id; // From protect middleware
    const { companyName, certificateImageBase64, courseUrl, fileName, fileType } = req.body;

    // Validate required fields
    if (!companyName || !certificateImageBase64) {
      throw new AppError(400, 'Missing required fields: companyName, certificateImageBase64');
    }

    // Validate certificate data
    const validation = validateCertificateData(
      { certificateImageBase64, fileName, fileType },
      companyName
    );

    if (!validation.isValid) {
      throw new AppError(400, 'Invalid certificate data', validation.errors);
    }

    console.log(`[Verify Certificate] User ${userId} (${req.user.name}) verifying against ${companyName}`);

    // Call the orchestrator service
    const result = await verifyOrganizationCertificate(
      userId,
      {
        certificateImageBase64,
        fileName: fileName || 'certificate',
        fileType: fileType || 'image/jpeg',
        courseUrl
      },
      companyName,
      req.user.name  // Pass user's name for verification
    );

    // Return result
    return res.status(200).json(new ApiResponse(200, {
        verified: result.verified,
        autoApproved: result.autoApproved,
        matchScore: result.matchScore,
        credential: {
          _id: result.credential._id,
          title: result.credential.title,
          issuer: result.credential.issuer,
          verificationStatus: result.credential.verificationStatus,
          isOrganizationVerified: result.credential.isOrganizationVerified,
          createdAt: result.credential.createdAt
        },
        processingTime: result.processingTime
      }, result.verified ? (result.autoApproved ? 'Certificate verified successfully' : 'Certificate matched but requires manual review') : 'Certificate submitted for manual review'));

  } catch (error) {
    console.error('[Verify Certificate] Error:', error);
    throw new AppError(500, 'Failed to verify certificate');
  }
};
