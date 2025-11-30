import Verification from '../models/Verification.js';
import { extractTextFromImage, cleanOcrText } from '../utils/ocrProcessor.js';
import { extractCertificateData, validateExtractedData } from '../utils/llmExtractor.js';
import { uploadCertificateImage } from '../utils/imagekitService.js';
import { verifyToken, matchUserWithExtractedData, saveCredentialToMainBackend } from '../utils/authService.js';
import { verifyCertificate as validateCertificate } from '../utils/domainValidator.js';

// Try to turn messy certificate dates like "5th January" into "2025-01-05"
const normalizeCertificateDate = (issueDateStr, completionDateStr, ocrText) => {
  let raw = issueDateStr || completionDateStr;
  if (!raw) return null;

  // 1) Strip "st/nd/rd/th" from the day and trim punctuation
  let cleaned = String(raw)
    .replace(/(\d{1,2})(st|nd|rd|th)/gi, '$1')   // 5th -> 5
    .replace(/[.,]/g, ' ')                       // remove stray commas/dots
    .replace(/\s+/g, ' ')                        // normalize spaces
    .trim();

  // 2) If there's no year in the date, try to grab a year from the OCR text (e.g. "... Competition 2025")
  if (!/\b\d{4}\b/.test(cleaned) && ocrText) {
    const yearMatch = String(ocrText).match(/\b(20\d{2})\b/); // 2000–2099
    if (yearMatch) {
      cleaned += ` ${yearMatch[1]}`; // "5 January" -> "5 January 2025"
    }
  }

  // 3) Parse with JS Date
  const parsed = new Date(cleaned);
  if (isNaN(parsed.getTime())) {
    // If still not parseable, better return null than a bad string
    return null;
  }

  // 4) Return ISO date-only string (YYYY-MM-DD)
  return parsed.toISOString().slice(0, 10);
};

/**
 * Main certificate verification endpoint with authentication
 */
export const verifyCertificate = async (req, res) => {
  try {
    console.log('\n=== VERIFICATION REQUEST ===');
    console.log('Has file:', !!req.file);
    console.log('Body keys:', Object.keys(req.body));
    console.log('Has auth header:', !!req.headers.authorization);
    console.log('===========================\n');

    // Step 0: Verify authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please login to the extension first.',
      });
    }

    const token = authHeader.split(' ')[1];
    const authResult = await verifyToken(token);

    if (!authResult.isValid) {
      return res.status(401).json({
        success: false,
        error: authResult.error || 'Invalid or expired token',
      });
    }

    const authenticatedUser = authResult.user;
    console.log('✓ Authenticated user:', authenticatedUser.name, `(${authenticatedUser.email})`);

    let imageBuffer;
    let filename;

    // Check if file is uploaded OR if image_url is provided
    if (req.file) {
      imageBuffer = req.file.buffer;
      filename = req.file.originalname;
    } else if (req.body.image_url) {
      // Fetch image from URL (server-side, not restricted by CORS)
      console.log('Fetching image from URL:', req.body.image_url);
      try {
        const imageResponse = await fetch(req.body.image_url);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        const arrayBuffer = await imageResponse.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        filename = req.body.image_url.split('/').pop().split('?')[0] || 'certificate.jpg';
        console.log('Successfully fetched image from URL, size:', imageBuffer.length);
      } catch (fetchError) {
        return res.status(400).json({
          success: false,
          error: `Failed to fetch image from URL: ${fetchError.message}`,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded or image_url provided',
      });
    }

    // Get page URL from request
    const pageUrl = req.body.page_url || req.body.pageUrl;
    if (!pageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Page URL is required',
      });
    }

    console.log('Processing certificate verification...');
    console.log('File:', filename);
    console.log('Page URL:', pageUrl);

    // Step 1: Extract text from image using OCR
    const { text: rawOcrText, confidence } = await extractTextFromImage(imageBuffer);
    const cleanedOcrText = cleanOcrText(rawOcrText);

    console.log('OCR Text extracted, confidence:', confidence);
    console.log('\n📝 RAW OCR TEXT:');
    console.log('---START---');
    console.log(cleanedOcrText);
    console.log('---END---\n');

    // Step 2: Extract structured data using LLM
    const extractedData = await extractCertificateData(cleanedOcrText);
    console.log('Extracted data:', extractedData);

    // Step 3: Validate extracted data
    const dataValidation = validateExtractedData(extractedData);
    if (!dataValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Failed to extract required information from certificate',
        details: dataValidation.errors,
        extractedData,
      });
    }

    // Step 4: Verify certificate (domain matching, whitelist check)
    const verification = validateCertificate(pageUrl, extractedData);

    // Step 5: Match extracted name with authenticated user
    const nameMatch = matchUserWithExtractedData(extractedData.personName, authenticatedUser);
    console.log('Name matching result:', nameMatch);

    if (!nameMatch.isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Name mismatch: The name on the certificate does not match your profile',
        details: {
          extractedName: extractedData.personName,
          yourName: authenticatedUser.name,
          reason: nameMatch.reason,
          confidence: nameMatch.confidence,
        },
      });
    }

    // Step 6: Upload image to ImageKit
    console.log('Uploading image to ImageKit...');
    const imagekitUpload = await uploadCertificateImage(imageBuffer, {
      fileName: filename,
      personName: extractedData.personName,
      companyName: extractedData.companyName,
      courseName: extractedData.courseName,
      tags: [
        authenticatedUser._id.toString(),
        extractedData.companyName?.toLowerCase().replace(/\s+/g, '-'),
        'extension-upload',
      ],
      customMetadata: {
        userId: authenticatedUser._id.toString(),
        userName: authenticatedUser.name,
        userEmail: authenticatedUser.email,
        extractedFrom: pageUrl,
        certificateId: extractedData.certificateId || '',
      },
    });

    console.log('✓ Image uploaded to ImageKit:', imagekitUpload.url);

    // Step 7: Save credential to main backend
    const issueDateNormalized = normalizeCertificateDate(
      extractedData.issueDate,
      extractedData.completionDate,
      cleanedOcrText
    );

    const credentialPayload = {
      title: extractedData.courseName || extractedData.programName || 'Certificate',
      issuer: extractedData.companyName,
      issueDate: issueDateNormalized,
      expiryDate: null,
      credentialType: 'certificate',
      credentialId: extractedData.certificateId || '',
      skills: extractedData.skills || [],
      description: extractedData.description || `Certificate from ${extractedData.companyName}`,
      file: {
        url: imagekitUpload.url,
        fileName: imagekitUpload.fileName,
        fileType: imagekitUpload.fileType || 'image/jpeg',
      },
      isPublic: false,
      status: 'verified',
      verificationNotes: `Auto-verified via browser extension. Name match confidence: ${nameMatch.confidence}%. Domain: ${pageUrl}`,
      metadata: {
        extractedViaExtension: true,
        extractionDate: new Date().toISOString(),
        sourceUrl: pageUrl,
        ocrConfidence: confidence,
        nameMatchConfidence: nameMatch.confidence,
        imagekitFileId: imagekitUpload.fileId,
        extractedData: {
          personName: extractedData.personName,
          issuerName: extractedData.issuerName,
          verificationLink: extractedData.verificationLink,
          grade: extractedData.grade,
          duration: extractedData.duration,
        },
      },
    };

    console.log('\n' + '🔵'.repeat(40));
    console.log('📤 SENDING TO MAIN BACKEND');
    console.log('🔵'.repeat(40));
    console.log('\n👤 AUTHENTICATED USER DATA:');
    console.log(JSON.stringify({
      _id: authenticatedUser._id,
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
    }, null, 2));
    console.log('\n📋 CREDENTIAL PAYLOAD:');
    console.log(JSON.stringify(credentialPayload, null, 2));
    console.log('\n🔵'.repeat(40) + '\n');

    const savedCredential = await saveCredentialToMainBackend(token, credentialPayload);
    console.log('✓ Credential saved to main backend:', savedCredential._id);

    // Step 8: Prepare response
    const response = {
      success: true,
      isVerified: true,
      nameMatch: {
        matched: true,
        confidence: nameMatch.confidence,
        reason: nameMatch.reason,
      },
      extractedData: {
        personName: extractedData.personName,
        companyName: extractedData.companyName,
        issuerName: extractedData.issuerName,
        courseName: extractedData.courseName,
        programName: extractedData.programName,
        certificateId: extractedData.certificateId,
        verificationLink: extractedData.verificationLink,
        issueDate: issueDateNormalized,
        completionDate: extractedData.completionDate,
        duration: extractedData.duration,
        skills: extractedData.skills,
        grade: extractedData.grade,
        description: extractedData.description,
      },
      verification: {
        isVerified: verification.isVerified,
        domainMatch: verification.domainValidation?.isValid || false,
        isWhitelistedDomain: verification.domainValidation?.isWhitelisted || false,
        companyMatchScore: verification.domainValidation?.score || 0,
      },
      imageUpload: {
        url: imagekitUpload.url,
        thumbnailUrl: imagekitUpload.thumbnailUrl,
        fileId: imagekitUpload.fileId,
      },
      savedCredential: {
        id: savedCredential._id,
        title: savedCredential.title,
        status: savedCredential.status,
      },
      ocr: {
        confidence,
        textLength: cleanedOcrText.length,
      },
    };

    // Debug output
    console.log('\n' + '='.repeat(80));
    console.log('📋 VERIFICATION COMPLETE');
    console.log('='.repeat(80));
    console.log('✓ Status: ✅ VERIFIED & SAVED');
    console.log('👤 Person:', extractedData.personName);
    console.log('👤 User:', authenticatedUser.name, `(${authenticatedUser.email})`);
    console.log('🎯 Name Match:', `${nameMatch.confidence}% - ${nameMatch.reason}`);
    console.log('🏢 Company:', extractedData.companyName);
    console.log('📚 Course:', extractedData.courseName);
    console.log('🖼️  ImageKit URL:', imagekitUpload.url);
    console.log('💾 Credential ID:', savedCredential._id);
    console.log('='.repeat(80) + '\n');

    res.json(response);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Save verification to database
 */
export const saveVerification = async (req, res) => {
  try {
    const verificationData = req.body;

    // Debug output
    console.log('\n' + '='.repeat(80));
    console.log('💾 SAVE VERIFICATION REQUEST');
    console.log('='.repeat(80));
    console.log('👤 Person:', verificationData.personName);
    console.log('🏢 Company:', verificationData.companyName);
    console.log('✓ Verified:', verificationData.isVerified ? '✅ YES' : '❌ NO');
    console.log('🌐 Page URL:', verificationData.pageUrl);
    console.log('📝 Extension Version:', req.body.extensionVersion);
    console.log('🔍 Has Image:', verificationData.certificateImage ? '✅ YES' : '❌ NO');
    console.log('='.repeat(80) + '\n');

    // Check if MongoDB is connected
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️  MongoDB not connected - data not saved to database');
      console.log('📋 Data would have been saved:');
      console.log(JSON.stringify({
        personName: verificationData.personName,
        companyName: verificationData.companyName,
        isVerified: verificationData.isVerified,
        pageUrl: verificationData.pageUrl,
        hasImage: !!verificationData.certificateImage,
        extractedDataFields: Object.keys(verificationData.extractedData || {}),
      }, null, 2));

      return res.json({
        success: true,
        message: 'Verification logged (database not connected)',
        saved: false,
      });
    }

    // Create new verification record
    const verification = new Verification({
      personName: verificationData.personName,
      companyName: verificationData.companyName,
      isVerified: verificationData.isVerified,
      certificateImage: verificationData.certificateImage,
      pageUrl: verificationData.pageUrl,
      extractedData: verificationData.extractedData,
      verificationDetails: verificationData.verificationDetails,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        extensionVersion: req.body.extensionVersion,
      },
    });

    await verification.save();
    console.log('✅ Verification saved to database with ID:', verification._id);

    res.json({
      success: true,
      message: 'Verification saved successfully',
      verificationId: verification._id,
      saved: true,
    });
  } catch (error) {
    console.error('❌ Save verification error:', error);
    console.log('📋 Data attempted to save:', {
      personName: req.body.personName,
      companyName: req.body.companyName,
      isVerified: req.body.isVerified,
    });

    res.status(500).json({
      success: false,
      error: error.message,
      saved: false,
    });
  }
};

/**
 * Get all verifications
 */
export const getVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, verified } = req.query;

    const query = {};
    if (verified !== undefined) {
      query.isVerified = verified === 'true';
    }

    const verifications = await Verification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-certificateImage'); // Exclude image from list view

    const count = await Verification.countDocuments(query);

    res.json({
      success: true,
      verifications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get single verification by ID
 */
export const getVerificationById = async (req, res) => {
  try {
    const verification = await Verification.findById(req.params.id);

    if (!verification) {
      return res.status(404).json({
        success: false,
        error: 'Verification not found',
      });
    }

    res.json({
      success: true,
      verification,
    });
  } catch (error) {
    console.error('Get verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
