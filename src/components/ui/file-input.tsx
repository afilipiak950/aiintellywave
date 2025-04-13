
import React, { useRef, useState } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { formatFileSize, isAllowedFileType } from '@/utils/file-utils';

interface FileInputProps {
  onFileSelect: (file: File | null) => void;
  allowedTypes?: string[];
  maxSizeInBytes?: number;
  className?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
  onFileSelect, 
  allowedTypes = ['pdf'], 
  maxSizeInBytes = 5 * 1024 * 1024, // 5MB default
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Check file type
      if (!isAllowedFileType(file, allowedTypes)) {
        alert(`Only ${allowedTypes.join(', ')} files are allowed.`);
        return;
      }

      // Check file size
      if (file.size > maxSizeInBytes) {
        alert(`File must be smaller than ${formatFileSize(maxSizeInBytes)}.`);
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedTypes.map(type => `.${type}`).join(',')}
        className="hidden"
      />
      <Button 
        type="button" 
        variant="outline" 
        onClick={triggerFileInput}
      >
        Choose File
      </Button>
      {selectedFile && (
        <span className="text-sm text-muted-foreground">
          {selectedFile.name} ({formatFileSize(selectedFile.size)})
        </span>
      )}
    </div>
  );
};
