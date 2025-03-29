
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "./use-toast";
import { ExcelRow, ProjectExcelRow } from '../types/project';
import * as XLSX from 'xlsx';
import { Json } from '../integrations/supabase/types';
import { Lead } from '@/types/lead';

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
      
      const { data, error } = await supabase
        .from('project_excel_data')
        .select('*')
        .eq('project_id', projectId)
        .order('row_number', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const firstRowColumns = Object.keys(data[0].row_data || {});
        setColumns(firstRowColumns);
        
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
      
      const cols = Object.keys(jsonData[0] as object);
      
      // Step 1: Insert leads into the leads table
      const leadsToInsert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>[] = jsonData.map((row, index) => ({
        name: row['Name'] || row['name'] || `Lead ${index + 1}`,
        company: row['Company'] || row['company'] || null,
        email: row['Email'] || row['email'] || null,
        phone: row['Phone'] || row['phone'] || null,
        position: row['Position'] || row['position'] || null,
        status: 'new',
        notes: JSON.stringify(row),
        project_id: projectId,
        score: 0,
        tags: cols,
        last_contact: null
      }));
      
      console.log('Inserting leads into leads table:', leadsToInsert.length);
      
      const { data: insertedLeads, error: leadsInsertError } = await supabase
        .from('leads')
        .insert(leadsToInsert)
        .select();
      
      if (leadsInsertError) {
        console.error('Error inserting leads:', leadsInsertError);
        toast({
          title: 'Error',
          description: `Failed to insert leads: ${leadsInsertError.message}`,
          variant: 'destructive'
        });
        throw leadsInsertError;
      }
      
      console.log('Successfully inserted leads:', insertedLeads?.length || 0);
      
      // Step 2: Store the original Excel data in project_excel_data for display
      await supabase
        .from('project_excel_data')
        .delete()
        .eq('project_id', projectId);
      
      const rowsToInsert = jsonData.map((row, index) => ({
        project_id: projectId,
        row_number: index + 1,
        row_data: row as Json,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      
      console.log('Inserting Excel data into project_excel_data table:', rowsToInsert.length);
      
      const { error } = await supabase
        .from('project_excel_data')
        .insert(rowsToInsert);
        
      if (error) throw error;
      
      console.log('Successfully inserted Excel data');
      
      setColumns(cols);
      
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
      const dataForExport = excelData.map(row => row.row_data);
      
      const worksheet = XLSX.utils.json_to_sheet(dataForExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      
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
      // First, delete leads associated with this project
      const { error: leadsDeleteError } = await supabase
        .from('leads')
        .delete()
        .eq('project_id', projectId);
        
      if (leadsDeleteError) {
        console.error('Error deleting leads:', leadsDeleteError);
        throw leadsDeleteError;
      }
      
      console.log('Successfully deleted leads for project:', projectId);
      
      // Then delete the Excel data
      const { error } = await supabase
        .from('project_excel_data')
        .delete()
        .eq('project_id', projectId);
        
      if (error) throw error;
      
      console.log('Successfully deleted Excel data for project:', projectId);
      
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
      const row = excelData.find(r => r.id === rowId);
      if (!row) return;
      
      const updatedRowData = {
        ...row.row_data,
        [column]: value
      };
      
      const { error } = await supabase
        .from('project_excel_data')
        .update({
          row_data: updatedRowData,
          updated_at: new Date().toISOString()
        })
        .eq('id', rowId);
        
      if (error) throw error;
      
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
