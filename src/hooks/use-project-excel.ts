
import { useState, useRef } from 'react';
import { useProjectExcelData } from './use-project-excel-data';
import { toast } from '@/hooks/use-toast';

export function useProjectExcel(projectId: string) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    excelData,
    columns,
    loading,
    uploading,
    processExcelFile,
    exportToExcel,
    deleteAllData,
    updateCellData,
    fetchExcelData
  } = useProjectExcelData(projectId);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      
      const file = e.target.files[0];
      await processExcelFile(file);
      
      // After processing, explicitly refresh the data to ensure UI updates
      console.log('File processed, refreshing Excel data');
      await fetchExcelData();
    } catch (error) {
      console.error('Error handling file upload:', error);
      toast({
        title: "Error",
        description: "There was a problem processing your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Clear the file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleDeleteAllData = () => {
    if (!window.confirm('Are you sure you want to delete all Excel data? This action cannot be undone.')) {
      return;
    }
    
    deleteAllData();
  };

  const uploadFile = () => fileInputRef.current?.click();
  
  return {
    excelData,
    columns,
    loading,
    uploading,
    searchTerm,
    fileInputRef,
    setSearchTerm,
    handleFileChange,
    handleDeleteAllData,
    exportToExcel,
    updateCellData,
    fetchExcelData, // Explicitly expose this function
    uploadFile
  };
}
