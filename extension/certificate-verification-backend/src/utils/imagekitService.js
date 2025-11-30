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
 * @param {Buffer} imageBuffer - The image buffer to upload
 * @param {Object} metadata - Additional metadata for the image
 * @returns {Promise<Object>} - Upload response with URL and fileId
 */
export const uploadCertificateImage = async (imageBuffer, metadata = {}) => {
  try {
    console.log('Starting ImageKit upload...');

    const imagekitClient = getImageKitClient();
    const folderPath = process.env.IMAGEKIT_FOLDER_PATH || '/Credentials';

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = metadata.fileName || `credential_${timestamp}.jpg`;

    // Prepare upload parameters
    const uploadParams = {
      file: imageBuffer,
      fileName: fileName,
      folder: folderPath,
      tags: [
        'credential',
        'certificate',
        metadata.personName || 'unknown',
        metadata.companyName || 'unknown',
        ...(metadata.tags || []),
      ],
      // Remove customMetadata - ImageKit requires fields to be created first in dashboard
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
    throw new Error(`Failed to upload image to ImageKit: ${error.message}`);
  }
};

/**
 * Delete image from ImageKit
 * @param {string} fileId - The ImageKit file ID to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteImageFromImageKit = async (fileId) => {
  try {
    const imagekitClient = getImageKitClient();
    await imagekitClient.deleteFile(fileId);
    console.log(`Image ${fileId} deleted from ImageKit`);
    return true;
  } catch (error) {
    console.error('ImageKit delete error:', error);
    throw new Error(`Failed to delete image from ImageKit: ${error.message}`);
  }
};

/**
 * Get image details from ImageKit
 * @param {string} fileId - The ImageKit file ID
 * @returns {Promise<Object>} - Image details
 */
export const getImageDetails = async (fileId) => {
  try {
    const imagekitClient = getImageKitClient();
    const details = await imagekitClient.getFileDetails(fileId);
    return details;
  } catch (error) {
    console.error('ImageKit get details error:', error);
    throw new Error(`Failed to get image details: ${error.message}`);
  }
};

export default {
  uploadCertificateImage,
  deleteImageFromImageKit,
  getImageDetails,
};
