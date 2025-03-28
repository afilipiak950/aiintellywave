
import React from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from "../../button";

interface FileHeaderProps {
  fileCount: number;
  uploading: boolean;
  canEdit: boolean;
  onUploadClick: () => void;
}

const FileHeader: React.FC<FileHeaderProps> = ({ 
  fileCount, 
  uploading, 
  canEdit, 
  onUploadClick 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h2 className="text-xl font-semibold">Project Files</h2>
        <p className="text-gray-500 text-sm">
          {fileCount > 0 
            ? `${fileCount} files uploaded` 
            : 'No files uploaded for this project'}
        </p>
      </div>
      
      {canEdit && (
        <div>
          <Button 
            onClick={onUploadClick}
            disabled={uploading}
          >
            <UploadCloud size={16} className="mr-2" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileHeader;
