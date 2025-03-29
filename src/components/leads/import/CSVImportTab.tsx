
import { useState } from 'react';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CSVImportTabProps {
  onLeadCreated: () => void;
  projectId?: string;
}

const CSVImportTab = ({ onLeadCreated, projectId }: CSVImportTabProps) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isMappingComplete, setIsMappingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      const file = acceptedFiles[0];
      setCsvFile(file);
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data as Record<string, any>[]);
        },
        error: (error) => {
          console.error('CSV Parsing Error:', error);
          toast({
            title: "Error",
            description: "Failed to parse CSV file. Please ensure it's a valid CSV.",
            variant: "destructive"
          });
        }
      });
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  
  const handleColumnMappingChange = (csvColumn: string, leadProperty: string) => {
    setColumnMapping(prev => ({ ...prev, [csvColumn]: leadProperty }));
  };
  
  const handleCompleteMapping = () => {
    if (Object.keys(columnMapping).length === 0) {
      toast({
        title: "Warning",
        description: "Please map at least one column before proceeding.",
        variant: "destructive" // Changed from "warning" to "destructive"
      });
      return;
    }
    setIsMappingComplete(true);
  };
  
  const getMappedValue = (row: Record<string, any>, mappedColumns: Record<string, string>, leadProperty: string, defaultValue: any) => {
    const csvColumn = Object.keys(mappedColumns).find(key => mappedColumns[key] === leadProperty);
    return csvColumn ? row[csvColumn] || defaultValue : defaultValue;
  };
  
  const createLead = async (row: Record<string, any>, mappedColumns: Record<string, string>) => {
    try {
      // Map the CSV data to lead properties
      const leadData = {
        name: getMappedValue(row, mappedColumns, 'name', ''),
        email: getMappedValue(row, mappedColumns, 'email', ''),
        phone: getMappedValue(row, mappedColumns, 'phone', ''),
        company: getMappedValue(row, mappedColumns, 'company', ''),
        position: getMappedValue(row, mappedColumns, 'position', ''),
        status: 'new' as const,
        project_id: projectId || '',
        score: 0,
        tags: [],
        notes: '',
        last_contact: null,
        website: null,
        extra_data: {} as Record<string, any>
      };
      
      // Add any additional fields from the CSV to extra_data
      Object.keys(row).forEach(key => {
        if (!Object.values(mappedColumns).includes(key)) {
          leadData.extra_data[key] = row[key];
        }
      });
      
      // Insert the lead into the database
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating lead:', error);
        return false;
      }
      
      console.log('Lead created:', data);
      return true;
    } catch (error) {
      console.error('Error in createLead:', error);
      return false;
    }
  };
  
  const handleImportLeads = async () => {
    setIsLoading(true);
    try {
      if (!parsedData.length) {
        toast({
          title: "Warning",
          description: "No data to import. Please upload a CSV file.",
          variant: "destructive" // Changed from "warning" to "destructive"
        });
        return;
      }
      
      let importSuccessCount = 0;
      for (const row of parsedData) {
        const success = await createLead(row, columnMapping);
        if (success) {
          importSuccessCount++;
        }
      }
      
      toast({
        title: "Success",
        description: `Successfully imported ${importSuccessCount} leads.`,
      });
      
      if (onLeadCreated) {
        onLeadCreated();
      }
      
      // Reset state
      setCsvFile(null);
      setParsedData([]);
      setColumnMapping({});
      setIsMappingComplete(false);
    } catch (error) {
      console.error('Error importing leads:', error);
      toast({
        title: "Error",
        description: "Failed to import leads. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const leadProperties = {
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    company: 'Company',
    position: 'Position',
  };
  
  return (
    <div>
      <DialogHeader>
        <DialogTitle>Import Leads from CSV</DialogTitle>
        <DialogDescription>
          Upload your CSV file and map the columns to the appropriate lead
          properties.
        </DialogDescription>
      </DialogHeader>
      
      <div {...getRootProps()} className="rounded-md border-2 border-dashed border-gray-400 p-6 text-center cursor-pointer">
        <input {...getInputProps()} />
        {csvFile ? (
          <p>File: {csvFile.name}</p>
        ) : (
          <p>
            {isDragActive
              ? 'Drop the files here ...'
              : 'Drag and drop a CSV file here, or click to select files'}
          </p>
        )}
      </div>
      
      {parsedData.length > 0 && !isMappingComplete && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Map Columns</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Map the columns from your CSV to the corresponding lead properties.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(parsedData[0]).map((csvColumn) => (
              <div key={csvColumn} className="flex flex-col space-y-2">
                <Label htmlFor={`select-${csvColumn}`}>{csvColumn}</Label>
                <Select onValueChange={(value) => handleColumnMappingChange(csvColumn, value)}>
                  <SelectTrigger id={`select-${csvColumn}`}>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(leadProperties).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          
          <Button className="mt-4" onClick={handleCompleteMapping}>
            Complete Mapping
          </Button>
        </div>
      )}
      
      {isMappingComplete && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Ready to Import?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Click the button below to import the leads.
          </p>
          <Button onClick={handleImportLeads} disabled={isLoading}>
            {isLoading ? 'Importing...' : 'Import Leads'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CSVImportTab;
