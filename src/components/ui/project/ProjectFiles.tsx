
import React from 'react';
import { useProjectFiles } from '../../../hooks/use-project-files';
import FileHeader from './file/FileHeader';
import FileSearch from './file/FileSearch';
import FileEmptyState from './file/FileEmptyState';
import FileGrid from './file/FileGrid';

interface ProjectFilesProps {
  projectId: string;
  canEdit: boolean;
}

const ProjectFiles = ({ projectId, canEdit }: ProjectFilesProps) => {
  const {
    files,
    filteredFiles,
    loading,
    uploading,
    searchTerm,
    fileInputRef,
    setSearchTerm,
    handleFileChange,
    handleDownloadFile,
    handleDeleteFile,
    uploadFile
  } = useProjectFiles(projectId);
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <FileHeader 
        fileCount={files.length}
        uploading={uploading}
        canEdit={canEdit}
        onUploadClick={uploadFile}
      />
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      
      {files.length > 0 && (
        <FileSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}
      
      {files.length === 0 ? (
        <FileEmptyState 
          canEdit={canEdit} 
          onUploadClick={uploadFile} 
        />
      ) : (
        <FileGrid 
          files={filteredFiles}
          canEdit={canEdit}
          onDownload={handleDownloadFile}
          onDelete={handleDeleteFile}
        />
      )}
    </div>
  );
};

export default ProjectFiles;
