
import { useState, useRef } from 'react';
import { useProjectExcelData } from './use-project-excel-data';
import { ExcelRow } from '../types/project';

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
    updateCellData
  } = useProjectExcelData(projectId);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      
      const file = e.target.files[0];
      await processExcelFile(file);
    } finally {
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
    uploadFile
  };
}
