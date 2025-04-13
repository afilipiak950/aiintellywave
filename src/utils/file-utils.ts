
/**
 * Format a file size in bytes to a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if a file is of an allowed type
 */
export function isAllowedFileType(file: File, allowedTypes: string[]): boolean {
  // Get the file extension
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  // Check if the extension is in the allowed types
  return allowedTypes.includes(extension);
}

/**
 * Extract text content from a file
 */
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsText(file);
  });
}
