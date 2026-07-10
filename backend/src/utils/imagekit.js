import ImageKit from 'imagekit';
import { config } from '#src/config/env.js';
// Initialize ImageKit
let imagekit = null;

const getImageKitClient = () => {
  if (!imagekitClient) {
    imagekit = new ImageKit({
      publicKey: config.IMAGEKIT_PUBLIC_KEY,
      privateKey: config.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return imagekit;
};

export const uploadCredentialFile = async (fileBuffer, metadata = {}) => {
  try {
    console.log('Starting ImageKit upload...');

    const imagekitClient = getImageKitClient();
    const folderPath = `${config.IMAGEKIT_FOLDER_PATH}/Credentials`;

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = metadata.fileName || `credential_${timestamp}`;

    // Prepare upload parameters
    const uploadParams = {
      file: fileBuffer,
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
