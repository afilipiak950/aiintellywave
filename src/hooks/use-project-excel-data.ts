
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { ExcelRow, ProjectExcelRow } from '../types/project';
import * as XLSX from 'xlsx';

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
      
      // Use a raw query with unchecked type
      const { data, error } = await (supabase as any)
        .from('project_excel_data')
        .select('*')
        .eq('project_id', projectId)
        .order('row_number', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Extract columns from the first row of data
        const firstRowColumns = Object.keys(data[0].row_data || {});
        setColumns(firstRowColumns);
        
        // Convert the data to our ExcelRow type
        const typedData: ExcelRow[] = data.map((item: ProjectExcelRow) => ({
          id: item.id,
          row_number: item.row_number,
          row_data: item.row_data || {},
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
        
        setExcelData(typedData);
      } else {
        setExcelData([]);
        setColumns([]);
      }
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
  
  const processExcelFile = async (file: File) => {
    try {
      setUploading(true);
      
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        throw new Error('Please upload an Excel or CSV file');
      }
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        throw new Error('The Excel file does not contain any data');
      }
      
      // Extract columns from the first row of data
      const cols = Object.keys(jsonData[0] as object);
      
      // Delete existing data first
      await (supabase as any)
        .from('project_excel_data')
        .delete()
        .eq('project_id', projectId);
      
      // Insert new data
      const rowsToInsert = jsonData.map((row, index) => ({
        project_id: projectId,
        row_number: index + 1,
        row_data: row,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      
      // Using raw SQL insert with unchecked type
      const { error } = await (supabase as any)
        .from('project_excel_data')
        .insert(rowsToInsert);
        
      if (error) throw error;
      
      // Update state
      setColumns(cols);
      
      // Refetch data to get the IDs
      fetchExcelData();
      
      toast({
        title: "Success",
        description: "Excel data processed and imported successfully.",
      });
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
      // Convert to format for export
      const dataForExport = excelData.map(row => row.row_data);
      
      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(dataForExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      
      // Generate Excel file and download
      XLSX.writeFile(workbook, `project_${projectId}_data.xlsx`);
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
      const { error } = await (supabase as any)
        .from('project_excel_data')
        .delete()
        .eq('project_id', projectId);
        
      if (error) throw error;
      
      setExcelData([]);
      setColumns([]);
      
      toast({
        title: "Success",
        description: "All Excel data deleted successfully.",
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
      // Find the row to update
      const row = excelData.find(r => r.id === rowId);
      if (!row) return;
      
      // Update row_data with new value
      const updatedRowData = {
        ...row.row_data,
        [column]: value
      };
      
      // Update in database
      const { error } = await (supabase as any)
        .from('project_excel_data')
        .update({
          row_data: updatedRowData,
          updated_at: new Date().toISOString()
        })
        .eq('id', rowId);
        
      if (error) throw error;
      
      // Update local state
      setExcelData(
        excelData.map(r => 
          r.id === rowId 
            ? { ...r, row_data: updatedRowData } 
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
    processExcelFile,
    exportToExcel,
    deleteAllData,
    updateCellData
  };
}
