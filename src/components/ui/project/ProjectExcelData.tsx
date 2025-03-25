
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../integrations/supabase/client';
import { FileSpreadsheet, Download, Upload, File, AlertCircle, Plus, Trash2, Save, X, Edit, Search } from 'lucide-react';
import { toast } from "../../../hooks/use-toast";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Card } from "../../ui/card";
import * as XLSX from 'xlsx';
import { ExcelRow, ProjectExcelRow } from '../../../types/project';

interface ProjectExcelDataProps {
  projectId: string;
  canEdit: boolean;
}

const ProjectExcelData = ({ projectId, canEdit }: ProjectExcelDataProps) => {
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState<{rowId: string, column: string} | null>(null);
  const [editValue, setEditValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      
      setUploading(true);
      
      const file = e.target.files[0];
      
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
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleExportToExcel = () => {
    try {
      if (excelData.length === 0) {
        toast({
          title: "Error",
          description: "No data to export.",
          variant: "destructive"
        });
        return;
      }
      
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
  
  const handleDeleteAllData = async () => {
    if (!window.confirm('Are you sure you want to delete all Excel data? This action cannot be undone.')) {
      return;
    }
    
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
  
  const startEditing = (rowId: string, column: string, value: any) => {
    if (!canEdit) return;
    setEditingCell({ rowId, column });
    setEditValue(value?.toString() || '');
  };
  
  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue('');
  };
  
  const saveEdit = async () => {
    if (!editingCell) return;
    
    try {
      const { rowId, column } = editingCell;
      
      // Find the row to update
      const row = excelData.find(r => r.id === rowId);
      if (!row) return;
      
      // Update row_data with new value
      const updatedRowData = {
        ...row.row_data,
        [column]: editValue
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
      
      cancelEditing();
      
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
    }
  };
  
  // Filter data based on search term
  const filteredData = excelData.filter(row => {
    if (!searchTerm) return true;
    
    // Search in all columns
    return Object.values(row.row_data).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Project Excel Data</h2>
          <p className="text-gray-500 text-sm">
            {excelData.length > 0 
              ? `${excelData.length} rows of data available` 
              : 'No Excel data available for this project'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".xlsx,.xls,.csv"
                id="excel-upload"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                variant="outline"
              >
                <FileSpreadsheet size={16} className="mr-2" />
                {uploading ? 'Processing...' : 'Upload Excel'}
              </Button>
              
              {excelData.length > 0 && (
                <Button 
                  variant="destructive"
                  onClick={handleDeleteAllData}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete All
                </Button>
              )}
            </>
          )}
          
          {excelData.length > 0 && (
            <Button 
              variant="outline"
              onClick={handleExportToExcel}
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>
      
      {excelData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Excel data available</h3>
          <p className="text-gray-500 mt-1">
            {canEdit 
              ? 'Upload an Excel file to add data to this project.' 
              : 'No Excel data has been added to this project yet.'}
          </p>
          {canEdit && (
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
            >
              <Upload size={16} className="mr-2" />
              Upload Excel File
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="search"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Row</TableHead>
                    {columns.map(column => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.row_number}</TableCell>
                      {columns.map(column => (
                        <TableCell key={`${row.id}-${column}`}>
                          {editingCell && editingCell.rowId === row.id && editingCell.column === column ? (
                            <div className="flex items-center space-x-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="py-1 h-8"
                              />
                              <Button size="sm" variant="ghost" onClick={saveEdit}>
                                <Save size={16} />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={cancelEditing}>
                                <X size={16} />
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className={`${canEdit ? 'cursor-pointer group relative' : ''}`}
                              onClick={() => canEdit && startEditing(row.id, column, row.row_data[column])}
                            >
                              {row.row_data[column]?.toString() || ''}
                              {canEdit && (
                                <Edit size={14} className="invisible group-hover:visible absolute top-1/2 right-0 transform -translate-y-1/2 text-gray-400" />
                              )}
                            </div>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectExcelData;
