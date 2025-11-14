/**
 * File Utilities Tests
 */
import {
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
} from '../../app/utils/fileUtils';

describe('fileUtils', () => {
  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(getFileExtension('test.jpg')).toBe('jpg');
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('file.name.with.dots.png')).toBe('png');
    });

    it('should return empty string for invalid input', () => {
      expect(getFileExtension('')).toBe('');
      expect(getFileExtension(null)).toBe('');
      expect(getFileExtension(undefined)).toBe('');
    });

    it('should convert to lowercase', () => {
      expect(getFileExtension('TEST.JPG')).toBe('jpg');
      expect(getFileExtension('Document.PDF')).toBe('pdf');
    });
  });

  describe('isImageFile', () => {
    it('should identify image files', () => {
      expect(isImageFile('photo.jpg')).toBe(true);
      expect(isImageFile('image.png')).toBe(true);
      expect(isImageFile('picture.jpeg')).toBe(true);
      expect(isImageFile('animation.gif')).toBe(true);
    });

    it('should reject non-image files', () => {
      expect(isImageFile('video.mp4')).toBe(false);
      expect(isImageFile('document.pdf')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isImageFile('PHOTO.JPG')).toBe(true);
    });
  });

  describe('isVideoFile', () => {
    it('should identify video files', () => {
      expect(isVideoFile('video.mp4')).toBe(true);
    });

    it('should reject non-video files', () => {
      expect(isVideoFile('image.jpg')).toBe(false);
      expect(isVideoFile('document.pdf')).toBe(false);
    });
  });

  describe('isDocumentFile', () => {
    it('should identify document files', () => {
      expect(isDocumentFile('document.pdf')).toBe(true);
      expect(isDocumentFile('sheet.xlsx')).toBe(true);
      expect(isDocumentFile('presentation.pptx')).toBe(true);
    });

    it('should reject non-document files', () => {
      expect(isDocumentFile('image.jpg')).toBe(false);
      expect(isDocumentFile('video.mp4')).toBe(false);
    });
  });

  describe('isSupportedFileType', () => {
    it('should accept supported file types', () => {
      expect(isSupportedFileType('image.jpg')).toBe(true);
      expect(isSupportedFileType('video.mp4')).toBe(true);
      expect(isSupportedFileType('document.pdf')).toBe(true);
    });

    it('should reject unsupported file types', () => {
      expect(isSupportedFileType('file.exe')).toBe(false);
      expect(isSupportedFileType('script.sh')).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should validate file size within limits', () => {
      const result = validateFileSize(1024 * 1024, false); // 1MB document
      expect(result.valid).toBe(true);
      expect(result.sizeMB).toBe(1);
    });

    it('should reject files exceeding document limit', () => {
      const result = validateFileSize(25 * 1024 * 1024, false); // 25MB document
      expect(result.valid).toBe(false);
      expect(result.error).toContain('20MB');
    });

    it('should reject files exceeding media limit', () => {
      const result = validateFileSize(3 * 1024 * 1024, true); // 3MB media
      expect(result.valid).toBe(false);
      expect(result.error).toContain('2MB');
    });

    it('should reject empty files', () => {
      const result = validateFileSize(0, false);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject invalid file size', () => {
      const result = validateFileSize(null, false);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('validateFile', () => {
    it('should validate complete file object', () => {
      const file = {
        uri: 'file://test.jpg',
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024 * 1024, // 1MB
      };
      const result = validateFile(file, true);
      expect(result.valid).toBe(true);
    });

    it('should reject unsupported file type', () => {
      const file = {
        uri: 'file://test.exe',
        name: 'test.exe',
        type: 'application/exe',
        size: 1024,
      };
      const result = validateFile(file, false);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not supported');
    });

    it('should reject oversized file', () => {
      const file = {
        uri: 'file://test.jpg',
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 5 * 1024 * 1024, // 5MB
      };
      const result = validateFile(file, true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds');
    });
  });

  describe('generateFileName', () => {
    it('should use existing name if provided', () => {
      const result = generateFileName('file://path/to/file', 'image/jpeg', 'myfile.jpg');
      expect(result).toBe('myfile.jpg');
    });

    it('should generate name from URI', () => {
      const result = generateFileName('file://path/to/photo.jpg', 'image/jpeg');
      expect(result).toContain('photo.jpg');
    });

    it('should add extension from type', () => {
      const result = generateFileName('file://path/to/file', 'image/png', null);
      expect(result).toContain('.png');
    });
  });

  describe('prepareFileForUpload', () => {
    it('should prepare file object correctly', () => {
      const response = {
        uri: 'file://test.jpg',
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024,
      };
      const result = prepareFileForUpload(response);
      expect(result).toHaveProperty('uri');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('size');
    });
  });

  describe('getMessageContentType', () => {
    it('should return "image" for image files', () => {
      expect(getMessageContentType('photo.jpg')).toBe('image');
    });

    it('should return "image" for video files', () => {
      expect(getMessageContentType('video.mp4')).toBe('image');
    });

    it('should return "file" for document files', () => {
      expect(getMessageContentType('document.pdf')).toBe('file');
    });
  });
});
