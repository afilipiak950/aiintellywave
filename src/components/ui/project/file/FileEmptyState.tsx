
import React from 'react';
import { FileText, Upload } from 'lucide-react';
import { Button } from "../../button";

interface FileEmptyStateProps {
  canEdit: boolean;
  onUploadClick: () => void;
}

const FileEmptyState: React.FC<FileEmptyStateProps> = ({ canEdit, onUploadClick }) => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No files uploaded</h3>
      <p className="text-gray-500 mt-1">
        {canEdit 
          ? 'Upload files to share with the project team.' 
          : 'No files have been uploaded to this project yet.'}
      </p>
      {canEdit && (
        <Button 
          onClick={onUploadClick}
          className="mt-4"
        >
          <Upload size={16} className="mr-2" />
          Upload File
        </Button>
      )}
    </div>
  );
};

export default FileEmptyState;
