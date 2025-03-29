
import { useState, useEffect } from 'react';
import { toast } from "./use-toast";
import { ExcelRow } from '../types/project';
import { 
  fetchProjectExcelData, 
  processExcelFile, 
  deleteProjectExcelData, 
  updateExcelCellData,
  exportExcelData
} from '../services/excel-data-service';

export function useProjectExcelData(projectId: string) {
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    fetchExcelData();
  }, [projectId]);
  
  const fetchExcelData = async () => {
    try {
      setLoading(true);
      
      const { data, columns: cols } = await fetchProjectExcelData(projectId);
      setExcelData(data);
      setColumns(cols);
    } catch (error) {
      console.error('Error fetching excel data:', error);
      toast({
        title: "Error",
        description: "Failed to load Excel data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const processExcelFileWrapper = async (file: File) => {
    try {
      setUploading(true);
      
      const insertedLeads = await processExcelFile(file, projectId);
      
      fetchExcelData();
      
      toast({
        title: "Success",
        description: `Excel data processed. ${insertedLeads?.length || 0} leads inserted.`,
      });

      return insertedLeads;
    } catch (error) {
      console.error('Error processing Excel:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process Excel data.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };
  
  const exportToExcel = () => {
    if (excelData.length === 0) {
      toast({
        title: "Error",
        description: "No data to export.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      exportExcelData(excelData, `project_${projectId}_data.xlsx`);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast({
        title: "Error",
        description: "Failed to export Excel data.",
        variant: "destructive"
      });
    }
  };
  
  const deleteAllData = async () => {
    try {
      await deleteProjectExcelData(projectId);
      
      setExcelData([]);
      setColumns([]);
      
      toast({
        title: "Success",
        description: "All Excel data and associated leads deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting Excel data:', error);
      toast({
        title: "Error",
        description: "Failed to delete Excel data.",
        variant: "destructive"
      });
    }
  };
  
  const updateCellData = async (rowId: string, column: string, value: string) => {
    try {
      await updateExcelCellData(rowId, column, value);
      
      // Update the local state
      setExcelData(
        excelData.map(r => 
          r.id === rowId 
            ? { ...r, row_data: { ...r.row_data, [column]: value } } 
            : r
        )
      );
      
      toast({
        title: "Success",
        description: "Cell data updated successfully.",
      });
    } catch (error) {
      console.error('Error updating cell:', error);
      toast({
        title: "Error",
        description: "Failed to update cell data.",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  return {
    excelData,
    columns,
    loading,
    uploading,
    fetchExcelData,
    processExcelFile: processExcelFileWrapper,
    exportToExcel,
    deleteAllData,
    updateCellData
  };
}
