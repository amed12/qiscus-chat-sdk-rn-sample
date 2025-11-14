/**
 * File Validation and Processing Utilities
 */
import { Platform } from 'react-native';
import { FILE_LIMITS, SUPPORTED_FILE_TYPES } from '../config/constants';

/**
 * Get file extension from filename
 * @param {string} name - Filename
 * @returns {string} File extension in lowercase
 */
export const getFileExtension = (name) => {
  if (!name) return '';
  const extension = name.slice((Math.max(0, name.lastIndexOf('.')) || Infinity) + 1);
  return extension.toLowerCase();
};

/**
 * Check if file is an image
 * @param {string} filename - Name of the file
 * @returns {boolean}
 */
export const isImageFile = (filename) => {
  const extension = getFileExtension(filename);
  return SUPPORTED_FILE_TYPES.IMAGES.includes(extension);
};

/**
 * Check if file is a video
 * @param {string} filename - Name of the file
 * @returns {boolean}
 */
export const isVideoFile = (filename) => {
  const extension = getFileExtension(filename);
  const supportedVideos = Platform.OS === 'android' 
    ? SUPPORTED_FILE_TYPES.VIDEOS.ANDROID 
    : SUPPORTED_FILE_TYPES.VIDEOS.IOS;
  return supportedVideos.includes(extension);
};

/**
 * Check if file is a document
 * @param {string} filename - Name of the file
 * @returns {boolean}
 */
export const isDocumentFile = (filename) => {
  const extension = getFileExtension(filename);
  return SUPPORTED_FILE_TYPES.DOCUMENTS.includes(extension);
};

/**
 * Check if file type is supported
 * @param {string} filename - Name of the file
 * @returns {boolean}
 */
export const isSupportedFileType = (filename) => {
  return isImageFile(filename) || isVideoFile(filename) || isDocumentFile(filename);
};

/**
 * Check if file type is unsupported
 * @param {string} filename - Name of the file
 * @returns {boolean}
 */
export const isUnsupportedFileType = (filename) => {
  return !isSupportedFileType(filename);
};

/**
 * Validate file size
 * @param {number} sizeInBytes - File size in bytes
 * @param {boolean} isMedia - Whether file is image/video (has stricter limit)
 * @returns {{valid: boolean, error?: string, sizeMB: number}}
 */
export const validateFileSize = (sizeInBytes, isMedia = false) => {
  if (sizeInBytes == null || isNaN(sizeInBytes)) {
    return {
      valid: false,
      error: 'File size is required',
      sizeMB: 0,
    };
  }

  const sizeMB = parseFloat((sizeInBytes / FILE_LIMITS.MB_TO_BYTES).toFixed(2));
  
  if (sizeMB === 0) {
    return {
      valid: false,
      error: 'File is empty',
      sizeMB: 0,
    };
  }

  const maxSize = isMedia ? FILE_LIMITS.MAX_MEDIA_SIZE_MB : FILE_LIMITS.MAX_DOCUMENT_SIZE_MB;
  
  if (sizeMB > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize}MB limit`,
      sizeMB,
    };
  }

  return {
    valid: true,
    sizeMB,
  };
};

/**
 * Validate complete file object
 * @param {Object} file - File object with uri, name, type, size
 * @param {boolean} isMedia - Whether file is image/video
 * @returns {{valid: boolean, error?: string}}
 */
export const validateFile = (file, isMedia = false) => {
  if (!file || !file.name) {
    return {
      valid: false,
      error: 'Invalid file object',
    };
  }

  // Check file type
  if (isUnsupportedFileType(file.name)) {
    return {
      valid: false,
      error: 'File type not supported',
    };
  }

  // Check file size
  const sizeValidation = validateFileSize(file.size, isMedia);
  if (!sizeValidation.valid) {
    return {
      valid: false,
      error: sizeValidation.error,
    };
  }

  return { valid: true };
};

/**
 * Generate filename from URI if not provided
 * @param {string} uri - File URI
 * @param {string} type - MIME type
 * @param {string} existingName - Existing filename if any
 * @returns {string} Generated filename
 */
export const generateFileName = (uri, type, existingName = null) => {
  if (existingName) {
    return existingName;
  }

  const fileNameFromUri = uri.split('/').pop();
  const fileType = type ? type.split('/').pop() : 'jpeg';
  
  return `${fileNameFromUri}.${fileType}`;
};

/**
 * Prepare file object for upload
 * @param {Object} response - Response from picker
 * @returns {Object} Prepared file object
 */
export const prepareFileForUpload = (response) => {
  const fileName = generateFileName(
    response.uri,
    response.type,
    response.name
  );

  return {
    uri: response.uri,
    name: fileName,
    type: response.type,
    size: response.size || response.fileSize,
  };
};

/**
 * Get content type for message payload
 * @param {string} filename - Name of the file
 * @returns {string} Content type ('image' or file type)
 */
export const getMessageContentType = (filename) => {
  if (isImageFile(filename) || isVideoFile(filename)) {
    return 'image';
  }
  return 'file';
};

export default {
  getFileExtension,
  isImageFile,
  isVideoFile,
  isDocumentFile,
  isSupportedFileType,
  isUnsupportedFileType,
  validateFileSize,
  validateFile,
  generateFileName,
  prepareFileForUpload,
  getMessageContentType,
};
