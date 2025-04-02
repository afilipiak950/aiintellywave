
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileUp, AlertCircle, File, X, Loader2, FileText, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatFileSize } from "@/utils/file-utils";

interface EnhancedDocumentUploadProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
  selectedFiles: File[];
  onClearFiles?: () => void;
}

export const EnhancedDocumentUpload: React.FC<EnhancedDocumentUploadProps> = ({ 
  onFilesSelected, 
  isProcessing,
  selectedFiles,
  onClearFiles
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fakeUploadProgress, setFakeUploadProgress] = useState<Record<string, number>>({});
  
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
      // Create fake upload progress for visual feedback
      const progress: Record<string, number> = {};
      validFiles.forEach(file => {
        progress[file.name] = 0;
        simulateUploadProgress(file.name);
      });
      
      setFakeUploadProgress(progress);
      
      // Notify parent component
      onFilesSelected(validFiles);
    }
  };
  
  // Simulate upload progress for visual feedback
  const simulateUploadProgress = (fileName: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      
      setFakeUploadProgress(prev => ({
        ...prev,
        [fileName]: progress
      }));
    }, 200);
  };
  
  // Remove a file from selection
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    onFilesSelected(newFiles);
  };

  // Clear all files
  const clearAllFiles = () => {
    if (onClearFiles) {
      onClearFiles();
    }
  };
  
  return (
    <Card className="border border-indigo-100 dark:border-indigo-900/30 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-500" />
          Document Upload
        </CardTitle>
        <CardDescription>
          Enhance AI training with additional documents
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Drag and drop area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
              : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="document-upload"
            multiple
            onChange={handleChange}
            accept=".pdf,.txt,.doc,.docx,.rtf,.html,.md"
            className="hidden"
            disabled={isProcessing}
          />
          
          <label 
            htmlFor="document-upload" 
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <motion.div
              animate={dragActive 
                ? { y: [0, -10, 0], scale: [1, 1.1, 1] } 
                : {}
              }
              transition={{ duration: 1, repeat: dragActive ? Infinity : 0 }}
            >
              <div className={`p-3 rounded-full ${
                dragActive 
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800/50 dark:text-indigo-300' 
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                <Upload className="h-8 w-8" />
              </div>
            </motion.div>
            
            <p className="text-lg font-medium mt-4 mb-1">
              {dragActive ? 'Drop files here' : 'Drag and drop files here'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              or
            </p>
            <Button 
              type="button" 
              variant="outline"
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
              disabled={isProcessing}
            >
              <Plus size={16} className="mr-2" />
              Select Files
            </Button>
          </label>
        </div>
        
        {/* Error message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-300 text-sm"
          >
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <div className="whitespace-pre-line">{error}</div>
          </motion.div>
        )}
        
        {/* Selected files list */}
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Selected Documents ({selectedFiles.length})</h3>
              {!isProcessing && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFiles}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedFiles.map((file, index) => {
                const progress = fakeUploadProgress[file.name] || 100;
                const fileIconColor = getFileIconColor(file.name);
                
                return (
                  <div 
                    key={`${file.name}-${index}`} 
                    className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        <div className={`p-1 rounded-md ${fileIconColor} flex-shrink-0`}>
                          <File className="h-4 w-4 text-white" />
                        </div>
                        <div className="overflow-hidden min-w-0">
                          <p className="truncate font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        disabled={isProcessing}
                        className="h-7 w-7 flex-shrink-0"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    
                    <Progress 
                      value={progress} 
                      className="h-1" 
                      indicatorClassName={progress === 100 
                        ? "bg-green-500" 
                        : "bg-indigo-500"
                      } 
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
          Supported file types: PDF, TXT, DOC, DOCX, RTF, HTML, MD (Max 10MB per file)
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get a color based on file extension
function getFileIconColor(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'pdf':
      return 'bg-red-500';
    case 'doc':
    case 'docx':
      return 'bg-blue-500';
    case 'txt':
      return 'bg-gray-500';
    case 'rtf':
      return 'bg-purple-500';
    case 'html':
      return 'bg-orange-500';
    case 'md':
      return 'bg-green-500';
    default:
      return 'bg-indigo-500';
  }
}
