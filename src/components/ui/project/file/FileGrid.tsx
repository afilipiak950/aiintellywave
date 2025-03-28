
import React from 'react';
import FileCard from './FileCard';
import { ProjectFile } from '../../../types/project';

interface FileGridProps {
  files: ProjectFile[];
  canEdit: boolean;
  onDownload: (file: ProjectFile) => void;
  onDelete: (fileId: string, filePath: string) => void;
}

const FileGrid: React.FC<FileGridProps> = ({ 
  files, 
  canEdit, 
  onDownload, 
  onDelete 
}) => {
  if (files.length === 0) {
    return (
      <div className="col-span-2 text-center py-8">
        <p className="text-gray-500">No files matching your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {files.map(file => (
        <FileCard 
          key={file.id} 
          file={file} 
          canEdit={canEdit} 
          onDownload={onDownload} 
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default FileGrid;
