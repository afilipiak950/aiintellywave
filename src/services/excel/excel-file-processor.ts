
import * as XLSX from 'xlsx';
import { ExcelRow } from '@/types/project';

/**
 * Exports Excel data to an XLSX file
 */
export const exportExcelData = (data: ExcelRow[], filename: string): void => {
  try {
    if (data.length === 0) {
      throw new Error('No data to export');
    }
    
    const dataForExport = data.map(row => row.row_data);
    
    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw error;
  }
};

/**
 * Parses an Excel file into JSON
 */
export const parseExcelFile = async (file: File): Promise<{
  jsonData: any[],
  columns: string[]
}> => {
  try {
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
    
    const columns = Object.keys(jsonData[0] as object);
    
    return {
      jsonData,
      columns
    };
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw error;
  }
};
