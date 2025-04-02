
/**
 * Format a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted file size string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get file extension from a file name
 * @param fileName File name with extension
 * @returns File extension without dot (e.g., "pdf")
 */
export function getFileExtension(fileName: string): string {
  return fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

/**
 * Check if a file is of an allowed type
 * @param file File object to check
 * @param allowedExtensions Array of allowed file extensions (without dot)
 * @returns Boolean indicating if file is allowed
 */
export function isAllowedFileType(file: File, allowedExtensions: string[]): boolean {
  const extension = getFileExtension(file.name);
  return allowedExtensions.includes(extension);
}

/**
 * Create a data URL from a file
 * @param file File object
 * @returns Promise that resolves to a data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
