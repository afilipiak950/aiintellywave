
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createLeadData } from '@/services/leads';
import { toast } from '@/hooks/use-toast';
import { PaperclipIcon, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import { Lead } from '@/types/lead';

interface CSVImportTabProps {
  onLeadCreated: () => void;
  projectId?: string;
}

interface CSVRow {
  [key: string]: string;
}

const CSVImportTab = ({ onLeadCreated, projectId }: CSVImportTabProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && Array.isArray(results.data) && results.data.length > 0) {
            setParsedData(results.data as CSVRow[]);
            setColumns(Object.keys(results.data[0] as object));
            setImportStep('preview');
          } else {
            setError('No valid data found in CSV file');
          }
        },
        error: (error) => {
          setError(`Error parsing CSV: ${error.message}`);
        }
      });
    }
  };

  const validateRequiredField = (row: CSVRow): boolean => {
    // At minimum, a lead should have a name
    return !!row['Name'] || !!row['name'] || 
           !!(row['First Name'] && row['Last Name']) || 
           !!(row['first_name'] && row['last_name']);
  };

  const mapCSVRowToLead = (row: CSVRow): Omit<Lead, 'id' | 'created_at' | 'updated_at'> => {
    // Map with case insensitive field matching
    const getName = (): string => {
      if (row['Name'] || row['name']) {
        return row['Name'] || row['name'] || '';
      }
      
      const firstName = row['First Name'] || row['first_name'] || row['FirstName'] || '';
      const lastName = row['Last Name'] || row['last_name'] || row['LastName'] || '';
      
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
      
      return 'Unknown';
    };

    // Find case-insensitive matches for common fields
    const findField = (possibleNames: string[]): string | null => {
      const key = Object.keys(row).find(k => 
        possibleNames.some(name => k.toLowerCase() === name.toLowerCase())
      );
      return key ? row[key] : null;
    };

    const email = findField(['Email', 'email', 'Email Address', 'email_address']);
    const phone = findField(['Phone', 'phone', 'Phone Number', 'phone_number', 'Mobile', 'mobile']);
    const company = findField(['Company', 'company', 'Organization', 'organization']);
    const position = findField(['Position', 'position', 'Title', 'title', 'Job Title', 'job_title']);

    // Extract standard fields for the lead
    const standardFields = {
      name: getName(),
      email: email || null,
      phone: phone || null,
      company: company || null,
      position: position || null,
      status: 'new' as const,
      project_id: projectId || null,
      score: 0,
      tags: ['csv-import'],
      notes: `Imported from CSV on ${new Date().toISOString().split('T')[0]}`,
    };

    // Store all additional fields in extra_data
    const extraData: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      // Skip fields that were already mapped to standard fields
      if (!['Name', 'name', 'First Name', 'first_name', 'FirstName', 
            'Last Name', 'last_name', 'LastName', 'Email', 'email', 
            'Email Address', 'email_address', 'Phone', 'phone', 
            'Phone Number', 'phone_number', 'Mobile', 'mobile', 
            'Company', 'company', 'Organization', 'organization',
            'Position', 'position', 'Title', 'title', 'Job Title', 'job_title']
            .some(field => field.toLowerCase() === key.toLowerCase())) {
        extraData[key] = value;
      }
    }

    return {
      ...standardFields,
      extra_data: Object.keys(extraData).length > 0 ? extraData : null,
    };
  };

  const handleImport = async () => {
    if (!parsedData.length) return;
    
    setImportStep('importing');
    setIsLoading(true);
    setProgress({ current: 0, total: parsedData.length, success: 0, failed: 0 });

    let successCount = 0;
    let failedCount = 0;

    // Process each row sequentially to avoid overwhelming the server
    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      setProgress(prev => ({ ...prev, current: i + 1 }));
      
      try {
        if (validateRequiredField(row)) {
          const leadData = mapCSVRowToLead(row);
          await createLeadData(leadData);
          successCount++;
          setProgress(prev => ({ ...prev, success: prev.success + 1 }));
        } else {
          failedCount++;
          setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
          console.error('Row missing required fields:', row);
        }
      } catch (error) {
        failedCount++;
        setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
        console.error('Error importing lead:', error);
      }
    }

    setIsLoading(false);
    setImportStep('complete');

    if (successCount > 0) {
      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} leads${failedCount > 0 ? `, ${failedCount} failed` : ''}.`,
        variant: successCount > 0 ? "default" : "destructive"
      });
      onLeadCreated();
    } else {
      toast({
        title: "Import Failed",
        description: "No leads were imported. Check the file format and try again.",
        variant: "destructive"
      });
    }
  };

  const resetImport = () => {
    setFile(null);
    setParsedData([]);
    setColumns([]);
    setError(null);
    setImportStep('upload');
  };

  return (
    <div className="space-y-4 py-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {importStep === 'upload' && (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <PaperclipIcon className="h-10 w-10 text-gray-400 mb-4" />
          <p className="mb-4 text-sm text-gray-500">
            Upload a CSV file with lead information
          </p>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="max-w-sm"
          />
        </div>
      )}

      {importStep === 'preview' && parsedData.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Preview Import</h3>
            <span className="text-sm text-gray-500">{parsedData.length} leads found</span>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    {columns.slice(0, 4).map((col) => (
                      <th key={col} className="p-2 text-left font-medium">{col}</th>
                    ))}
                    {columns.length > 4 && <th className="p-2 text-left font-medium">...</th>}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t">
                      {columns.slice(0, 4).map((col) => (
                        <td key={col} className="p-2">{row[col] || '-'}</td>
                      ))}
                      {columns.length > 4 && <td className="p-2">...</td>}
                    </tr>
                  ))}
                  {parsedData.length > 5 && (
                    <tr>
                      <td colSpan={5} className="p-2 text-center text-gray-500">
                        + {parsedData.length - 5} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={resetImport}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isLoading}>
              {isLoading ? 'Importing...' : `Import ${parsedData.length} Leads`}
            </Button>
          </div>
        </div>
      )}

      {importStep === 'importing' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Importing Leads</h3>
            <span className="text-sm text-gray-500">{progress.current} / {progress.total}</span>
          </div>
          
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-green-600">{progress.success} successful</span>
            <span className="text-red-600">{progress.failed} failed</span>
          </div>
        </div>
      )}

      {importStep === 'complete' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <h3 className="text-lg font-medium">Import Complete</h3>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>{progress.success} leads successfully imported</span>
            {progress.failed > 0 && (
              <span className="text-red-600">{progress.failed} leads failed</span>
            )}
          </div>
          
          <Button onClick={resetImport} className="w-full">
            Import More Leads
          </Button>
        </div>
      )}
    </div>
  );
};

export default CSVImportTab;
