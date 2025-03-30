
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileUp, AlertCircle, File, X, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/utils/file-utils";

interface DocumentUploadProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  onFilesSelected, 
  isProcessing 
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);
  
  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };
  
  // Process selected files
  const handleFiles = (files: File[]) => {
    setError(null);
    
    // Filter for supported file types
    const supportedFiles = files.filter(file => {
      const fileType = file.type.toLowerCase();
      return (
        fileType.includes('pdf') || 
        fileType.includes('text/plain') || 
        fileType.includes('word') ||
        fileType.includes('application/rtf') ||
        fileType.includes('text/html') ||
        fileType.includes('text/markdown')
      );
    });
    
    // Check if any files were filtered out
    if (supportedFiles.length < files.length) {
      setError('Some files were skipped. Only PDF, TXT, DOC, DOCX, RTF, HTML, and MD files are supported.');
    }
    
    // Check file size (limit to 10MB per file)
    const validFiles = supportedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError((prev) => 
          prev ? `${prev}\nSome files exceed the 10MB size limit.` : 'Some files exceed the 10MB size limit.'
        );
        return false;
      }
      return true;
    });
    
    if (validFiles.length > 0) {
      // Add new files to existing selection
      setSelectedFiles(prev => [...prev, ...validFiles]);
      // Notify parent component
      onFilesSelected(validFiles);
    }
  };
  
  // Remove a file from selection
  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FileUp className="h-5 w-5 text-primary" />
        Upload Additional Documents
      </h2>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Upload PDF, TXT, DOC, DOCX, RTF, HTML, or MD files to enhance AI training (10MB max per file)
      </p>
      
      {/* Drag and drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 dark:border-gray-700 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleChange}
          accept=".pdf,.txt,.doc,.docx,.rtf,.html,.md"
          className="hidden"
          disabled={isProcessing}
        />
        
        <label 
          htmlFor="file-upload" 
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <Upload 
            className={`h-12 w-12 mb-4 ${
              dragActive ? 'text-primary' : 'text-gray-400 dark:text-gray-600'
            }`} 
          />
          
          <p className="text-lg font-medium mb-1">
            {dragActive ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            or
          </p>
          <Button 
            type="button" 
            variant="outline"
            disabled={isProcessing}
          >
            Select Files
          </Button>
        </label>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 mt-4 text-red-500 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">Selected Documents ({selectedFiles.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                <div className="flex items-center gap-3 overflow-hidden">
                  <File className="h-5 w-5 text-primary/70 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  disabled={isProcessing}
                  className="shrink-0"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
