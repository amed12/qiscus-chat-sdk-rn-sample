const imageRegex = /.+\.(jpe?g|gif|png)$/gi;

export default function getFileType(filename: string): 'image' | 'file' {
  const match = imageRegex.test(filename);
  if (match) return 'image';
  return 'file';
}

/**
 * Get mime type from the given filename
 * @param filename String
 */
export function getMime(filename: string): string {
  return filename.split('.').pop() || '';
}
