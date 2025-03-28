
export const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) return 'spreadsheet';
  if (fileType.includes('pdf')) return 'pdf';
  return 'text';
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
