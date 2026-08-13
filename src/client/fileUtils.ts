import { Platform } from 'react-native';

const SUPPORTED_IMAGE = ['png', 'jpg', 'jpeg', 'gif'];
const SUPPORTED_VIDEO = Platform.OS === 'android' ? ['mp4'] : ['mp4', 'mov'];
const SUPPORTED_DOC = [
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'odp', 'ods', 'odt', 'pdf', 'apk',
];
const ALL_SUPPORTED = [...SUPPORTED_IMAGE, ...SUPPORTED_VIDEO, ...SUPPORTED_DOC];

export const MAX_FILE_SIZE_MB = 20;
export const MAX_IMAGE_SIZE_MB = 2;

export function getFileExtension(name: string): string {
  return name.slice((Math.max(0, name.lastIndexOf('.')) || Infinity) + 1).toLowerCase();
}

export const isImageFile = (name: string): boolean =>
  SUPPORTED_IMAGE.includes(getFileExtension(name));

export const isVideoFile = (name: string): boolean =>
  SUPPORTED_VIDEO.includes(getFileExtension(name));

export const isUnsupportedFileType = (name: string): boolean =>
  !ALL_SUPPORTED.includes(getFileExtension(name));

export function fileSizeMB(bytes: number): number {
  return parseFloat((bytes / (1024 * 1024)).toFixed(2));
}
