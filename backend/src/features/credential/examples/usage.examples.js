/**
 * Example: How to use the Certificate Verification System
 * 
 * This file demonstrates the complete pipeline from image to verified credential
 */

import { processCertificateImage, verifyCertificateComplete } from '../verification/verification.service.js';

// ========================================
// Example 1: Process certificate (extract data only)
// ========================================

async function exampleExtractOnly() {
  const userId = '507f1f77bcf86cd799439012'; // MongoDB ObjectId
  const imageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'; // Your base64 image
  const sourceUrl = 'https://coursera.org/verify/ABC123XYZ';

  const result = await processCertificateImage({
    userId,
    imageData: imageBase64,
    sourceUrl,
    imageType: 'base64',
  });

  console.log('Extraction Method:', result.extractionMethod); // 'llm' or 'regex'
  console.log('OCR Text:', result.ocrText);
  console.log('Extracted Data:', result.extractedData);
  console.log('Name Match:', result.nameValidation);
  console.log('Domain Valid:', result.domainValidation);
  console.log('Warnings:', result.warnings);
}

// ========================================
// Example 2: Complete verification (extract + save)
// ========================================

async function exampleVerifyAndSave() {
  const userId = '507f1f77bcf86cd799439012';
  const imageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
  const sourceUrl = 'https://coursera.org/verify/ABC123XYZ';

  const fileData = {
    url: 'https://ik.imagekit.io/credverify/cert-123.jpg',
    fileName: 'coursera-ml-certificate.jpg',
    fileType: 'image/jpeg',
    storageId: 'imagekit-file-id-123',
  };

  const result = await verifyCertificateComplete({
    userId,
    imageData: imageBase64,
    sourceUrl,
    imageType: 'base64',
    fileData,
  });

  console.log('Saved Credential ID:', result.credential._id);
  console.log('Certificate Name:', result.credential.certificateName);
  console.log('Issuer:', result.credential.issuer);
  console.log('Name Match Confidence:', result.credential.nameMatchConfidence);
  console.log('Is Domain Trusted:', result.credential.isDomainTrusted);
}

// ========================================
// Example 3: API Request from Extension
// ========================================

const exampleAPIRequest = `
// In Chrome Extension (popup.js or background.js)

async function verifyCertificateFromExtension() {
  // 1. Get user's JWT token (stored after login)
  const token = await chrome.storage.local.get('authToken');
  
  // 2. Capture certificate image from page
  const imageData = await captureActiveTabImage(); // Your image capture function
  
  // 3. Get current page URL
  const sourceUrl = window.location.href;
  
  // 4. Call API
  const response = await fetch('http://localhost:5000/api/credentials/verify-certificate', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token.authToken}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageData: imageData, // base64 string
      sourceUrl: sourceUrl,
      imageType: 'base64',
      fileData: {
        url: imageData, // or upload to storage first
        fileName: 'certificate.jpg',
        fileType: 'image/jpeg',
      },
    }),
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Certificate verified!');
    console.log('Credential ID:', result.data.credential._id);
    console.log('Name Match:', result.data.processing.nameValidation.confidence + '%');
    
    // Show success message to user
    showNotification('Certificate verified and saved!');
  } else {
    console.error('Verification failed:', result.message);
  }
}
`;

// ========================================
// Example 4: Expected Response Format
// ========================================

const exampleSuccessResponse = {
  success: true,
  message: 'Certificate verified and saved successfully',
  data: {
    credential: {
      _id: '674d8f2a1234567890abcdef',
      user: '674d8e2a1234567890abcdef',
      legalNameSnapshot: 'John Michael Smith',
      certificateName: 'John M Smith',
      nameMatchConfidence: 87,
      title: 'Machine Learning Specialization',
      issuer: 'Coursera',
      issueDate: '2024-11-15T00:00:00.000Z',
      type: 'certificate',
      credentialId: 'ABC123XYZ456',
      nsqfLevel: 7,
      totalHours: 120,
      skills: ['Machine Learning', 'Python', 'TensorFlow', 'Neural Networks'],
      description: 'Comprehensive course on machine learning fundamentals and applications',
      file: {
        url: 'https://ik.imagekit.io/credverify/cert-123.jpg',
        fileName: 'certificate.jpg',
        fileType: 'image/jpeg',
        storageId: 'imagekit-file-id-123',
      },
      sourceUrl: 'https://coursera.org/verify/ABC123XYZ',
      sourceDomain: 'coursera.org',
      isDomainTrusted: true,
      isIssuerVerified: true,
      isPublic: false,
      meta: {
        extractionMethod: 'llm',
        ocrText: 'CERTIFICATE OF COMPLETION...',
        nameMatch: {
          match: true,
          confidence: 87,
          reason: 'High similarity match',
        },
        domainValidation: {
          isValid: true,
          isTrusted: true,
          reason: 'Domain is whitelisted as trusted issuer',
        },
      },
    },
    processing: {
      success: true,
      extractionMethod: 'llm',
      ocrText: 'CERTIFICATE OF COMPLETION\nThis is to certify that\nJohn M Smith...',
      extractedData: {
        personName: 'John M Smith',
        certificateName: 'Machine Learning Specialization',
        issuerName: 'Coursera',
        companyName: null,
        certificateId: 'ABC123XYZ456',
        verificationLink: 'https://coursera.org/verify/ABC123XYZ',
        issueDate: '2024-11-15',
        completionDate: null,
        duration: '4 months',
        grade: 'A',
        NSQFLevel: 7,
        learningHours: 120,
        skills: ['Machine Learning', 'Python', 'TensorFlow', 'Neural Networks'],
        description: 'Comprehensive course on machine learning fundamentals and applications',
      },
      nameValidation: {
        legalName: 'John Michael Smith',
        certificateName: 'John M Smith',
        match: true,
        confidence: 87,
        reason: 'High similarity match',
        normalizedLegal: 'john michael smith',
        normalizedCert: 'john m smith',
      },
      domainValidation: {
        sourceUrl: 'https://coursera.org/verify/ABC123XYZ',
        domain: 'coursera.org',
        isValid: true,
        isTrusted: true,
        reason: 'Domain is whitelisted as trusted issuer',
        fuzzyMatch: null,
      },
      warnings: [],
    },
  },
};

// ========================================
// Example 5: Handling Warnings
// ========================================

const exampleWithWarnings = {
  success: true,
  data: {
    processing: {
      nameValidation: {
        match: true,
        confidence: 65, // Low confidence
      },
      domainValidation: {
        isTrusted: false, // Not whitelisted
      },
      warnings: [
        'Name match confidence is low - please verify identity',
        'Source domain is not in trusted whitelist',
      ],
    },
  },
};

// ========================================
// Example 6: Error Responses
// ========================================

const exampleErrors = {
  // Missing required field
  missingData: {
    success: false,
    message: 'Image data is required',
  },

  // OCR failed
  ocrFailed: {
    success: false,
    message: 'OCR failed to extract meaningful text from image',
  },

  // Missing required fields after extraction
  missingFields: {
    success: false,
    message: 'Missing required fields: personName',
  },

  // User not found
  userNotFound: {
    success: false,
    message: 'User not found',
  },
};

// ========================================
// Example 7: Testing Different Image Types
// ========================================

async function exampleDifferentImageTypes() {
  const userId = '507f1f77bcf86cd799439012';
  const sourceUrl = 'https://coursera.org/verify/ABC123';

  // Base64 image
  const base64Result = await processCertificateImage({
    userId,
    imageData: 'data:image/jpeg;base64,/9j/4AAQ...',
    sourceUrl,
    imageType: 'base64',
  });

  // Image URL
  const urlResult = await processCertificateImage({
    userId,
    imageData: 'https://example.com/certificate.jpg',
    sourceUrl,
    imageType: 'url',
  });
}

export {
  exampleExtractOnly,
  exampleVerifyAndSave,
  exampleAPIRequest,
  exampleSuccessResponse,
  exampleWithWarnings,
  exampleErrors,
  exampleDifferentImageTypes,
};
