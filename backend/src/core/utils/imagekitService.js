import ImageKit from 'imagekit';

// Initialize ImageKit
let imagekit = null;

const getImageKitClient = () => {
  if (!imagekit) {
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      throw new Error('ImageKit credentials are not configured. Please check your .env file.');
    }

    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return imagekit;
};

/**
 * Upload certificate image to ImageKit
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {Object} metadata - Additional metadata for the file
 * @returns {Promise<Object>} - Upload response with URL and fileId
 */
export const uploadCredentialFile = async (fileBuffer, metadata = {}) => {
  try {
    console.log('Starting ImageKit upload...');

    const imagekitClient = getImageKitClient();
    const folderPath = process.env.IMAGEKIT_FOLDER_PATH || '/Credentials';

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = metadata.fileName || `credential_${timestamp}`;
    const mimeType = metadata.mimeType || (fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');

    // Ensure we send a supported type to SDK (base64 string is safest)
    let uploadFile;
    if (typeof fileBuffer === 'string') {
      // assume already base64 or URL
      uploadFile = fileBuffer;
    } else if (Buffer.isBuffer(fileBuffer)) {
      const base64 = fileBuffer.toString('base64');
      uploadFile = `data:${mimeType};base64,${base64}`;
    } else if (fileBuffer instanceof Uint8Array) {
      const base64 = Buffer.from(fileBuffer).toString('base64');
      uploadFile = `data:${mimeType};base64,${base64}`;
    } else {
      throw new Error('Unsupported fileBuffer type for ImageKit upload');
    }

    // Prepare upload parameters
    const uploadParams = {
      file: uploadFile,
      fileName: fileName,
      folder: folderPath,
      tags: [
        'credential',
        metadata.userName || 'unknown',
        metadata.issuer || 'unknown',
        ...(metadata.tags || []),
      ],
      useUniqueFileName: true,
    };

    // Upload to ImageKit
    const response = await imagekitClient.upload(uploadParams);

    console.log('ImageKit upload successful:', {
      fileId: response.fileId,
      url: response.url,
      name: response.name,
    });

    return {
      success: true,
      fileId: response.fileId,
      fileName: response.name,
      url: response.url,
      thumbnailUrl: response.thumbnailUrl,
      filePath: response.filePath,
      size: response.size,
      fileType: response.fileType,
    };
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error(`Failed to upload file to ImageKit: ${error.message}`);
  }
};

/**
 * Delete file from ImageKit
 * @param {string} fileId - The ImageKit file ID to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFileFromImageKit = async (fileId) => {
  try {
    const imagekitClient = getImageKitClient();
    await imagekitClient.deleteFile(fileId);
    console.log(`File ${fileId} deleted from ImageKit`);
    return true;
  } catch (error) {
    console.error('ImageKit delete error:', error);
    throw new Error(`Failed to delete file from ImageKit: ${error.message}`);
  }
};

/**
 * Get file details from ImageKit
 * @param {string} fileId - The ImageKit file ID
 * @returns {Promise<Object>} - File details
 */
export const getFileDetails = async (fileId) => {
  try {
    const imagekitClient = getImageKitClient();
    const details = await imagekitClient.getFileDetails(fileId);
    return details;
  } catch (error) {
    console.error('ImageKit get details error:', error);
    throw new Error(`Failed to get file details: ${error.message}`);
  }
};

export default {
  uploadCredentialFile,
  deleteFileFromImageKit,
  getFileDetails,
};
