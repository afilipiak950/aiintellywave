
import { useState, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileIcon, UploadIcon, Wand, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  const [customFields, setCustomFields] = useState<string[]>([]);
  const { toast } = useToast();
  
  const leadPropertyMappings = {
    name: ['name', 'full name', 'fullname', 'contact name', 'contactname', 'person name'],
    first_name: ['first name', 'firstname', 'given name'],
    last_name: ['last name', 'lastname', 'surname', 'family name'],
    email: ['email', 'email address', 'emailaddress', 'mail', 'e-mail'],
    phone: ['phone', 'phone number', 'phonenumber', 'mobile', 'telephone', 'tel', 'contact'],
    company: ['company', 'company name', 'organization', 'organisation', 'business', 'firm'],
    position: ['position', 'job title', 'jobtitle', 'title', 'role', 'designation'],
    website: ['website', 'web site', 'url', 'web', 'site'],
    industry: ['industry', 'sector', 'business type'],
    linkedin: ['linkedin', 'linkedin url', 'linkedin profile'],
    address: ['address', 'full address', 'location'],
    city: ['city', 'town'],
    state: ['state', 'province', 'region'],
    country: ['country', 'nation'],
    zipcode: ['zipcode', 'zip code', 'postal code', 'postalcode', 'zip'],
  };
  
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      const file = acceptedFiles[0];
      setCsvFile(file);
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Record<string, any>[];
          setParsedData(data);
          
          if (data.length > 0 && Object.keys(data[0]).length > 0) {
            autoMapColumns(Object.keys(data[0]));
          }
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
  
  const autoMapColumns = (csvColumns: string[]) => {
    const newMapping: Record<string, string> = {};
    
    csvColumns.forEach(csvColumn => {
      const normalizedCsvColumn = csvColumn.toLowerCase().trim();
      
      Object.entries(leadPropertyMappings).forEach(([leadProperty, variations]) => {
        if (
          variations.includes(normalizedCsvColumn) || 
          normalizedCsvColumn === leadProperty || 
          variations.some(v => normalizedCsvColumn.includes(v))
        ) {
          newMapping[csvColumn] = leadProperty;
        }
      });
      
      // Check if the column matches any custom field
      customFields.forEach(customField => {
        if (normalizedCsvColumn === customField.toLowerCase().trim()) {
          newMapping[csvColumn] = customField;
        }
      });
    });
    
    setColumnMapping(newMapping);
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
        variant: "destructive"
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
      const firstName = getMappedValue(row, mappedColumns, 'first_name', '');
      const lastName = getMappedValue(row, mappedColumns, 'last_name', '');
      
      let fullName = getMappedValue(row, mappedColumns, 'name', '');
      if (!fullName && (firstName || lastName)) {
        fullName = `${firstName} ${lastName}`.trim();
      }
      
      const leadData = {
        name: fullName || 'Unknown Contact',
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
        website: getMappedValue(row, mappedColumns, 'website', null),
        extra_data: {} as Record<string, any>
      };
      
      // Handle all mapped fields, including standard and custom
      Object.keys(row).forEach(key => {
        const mappedProperty = mappedColumns[key];
        if (mappedProperty) {
          // Check if it's a standard field
          if (!Object.keys(leadData).includes(mappedProperty)) {
            // It's a custom field or one not directly in leadData
            leadData.extra_data[mappedProperty] = row[key];
          }
        } else {
          // Unmapped field goes to extra_data with original column name
          leadData.extra_data[key] = row[key];
        }
      });
      
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
          variant: "destructive"
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
  
  // Generate lead properties including custom fields
  const generateLeadProperties = () => {
    const standardProperties = {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      position: 'Position',
      website: 'Website'
    };
    
    const allProperties: Record<string, string> = {...standardProperties};
    
    // Add custom fields
    customFields.forEach(field => {
      allProperties[field] = field;
    });
    
    return allProperties;
  };
  
  const handleAddCustomField = (fieldName: string) => {
    if (!fieldName.trim()) return;
    
    if (customFields.includes(fieldName)) {
      toast({
        title: "Warning",
        description: "This field already exists.",
        variant: "destructive"
      });
      return;
    }
    
    setCustomFields(prev => [...prev, fieldName]);
    
    // Re-run auto-mapping to include the new field
    if (parsedData.length > 0) {
      autoMapColumns(Object.keys(parsedData[0]));
    }
    
    toast({
      title: "Field Added",
      description: `${fieldName} has been added as a custom field.`
    });
  };
  
  const performAutoMapping = () => {
    if (parsedData.length > 0) {
      autoMapColumns(Object.keys(parsedData[0]));
      toast({
        title: "Auto-mapping applied",
        description: "Columns have been automatically mapped based on common field names."
      });
    }
  };
  
  const [newFieldName, setNewFieldName] = useState('');
  
  return (
    <div>
      <DialogHeader>
        <DialogTitle>Import Leads from CSV</DialogTitle>
        <DialogDescription>
          Upload your CSV file and map the columns to the appropriate lead
          properties.
        </DialogDescription>
      </DialogHeader>
      
      {!parsedData.length ? (
        <div 
          {...getRootProps()} 
          className="rounded-md border-2 border-dashed border-gray-400 p-6 text-center cursor-pointer mt-4"
        >
          <input {...getInputProps()} />
          <FileIcon className="mx-auto h-10 w-10 text-gray-400 mb-2" />
          <p>
            {isDragActive
              ? 'Drop the files here ...'
              : 'Drag and drop a CSV file here, or click to select files'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Supports .csv files
          </p>
        </div>
      ) : (
        <>
          {csvFile && (
            <div className="bg-gray-50 rounded-md p-3 mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <FileIcon className="h-5 w-5 mr-2 text-blue-600" />
                <span className="text-sm font-medium truncate max-w-[200px]">{csvFile.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCsvFile(null);
                  setParsedData([]);
                  setColumnMapping({});
                }}
              >
                Change
              </Button>
            </div>
          )}
        </>
      )}
      
      {parsedData.length > 0 && !isMappingComplete && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Map Columns</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={performAutoMapping}
                className="flex items-center text-sm"
              >
                <Wand className="mr-1 h-4 w-4" />
                Auto-map
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center text-sm"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Field
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-2" align="end">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="New field name"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="w-36"
                    />
                    <Button 
                      size="sm"
                      onClick={() => {
                        handleAddCustomField(newFieldName);
                        setNewFieldName('');
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Map the columns from your CSV to the corresponding lead properties.
            You can add custom fields if needed.
          </p>
          
          <ScrollArea className="h-[300px] border rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
              {Object.keys(parsedData[0]).map((csvColumn) => (
                <div key={csvColumn} className="flex flex-col space-y-2">
                  <Label htmlFor={`select-${csvColumn}`}>{csvColumn}</Label>
                  <Select 
                    value={columnMapping[csvColumn] || ""} 
                    onValueChange={(value) => handleColumnMappingChange(csvColumn, value)}
                  >
                    <SelectTrigger id={`select-${csvColumn}`}>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(generateLeadProperties()).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={handleCompleteMapping}>
              Continue
            </Button>
          </div>
        </div>
      )}
      
      {isMappingComplete && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Ready to Import</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {`You're about to import ${parsedData.length} leads with the following mapping:`}
          </p>
          
          <div className="bg-gray-50 rounded-md p-4 mb-6">
            <h4 className="font-medium mb-2 text-sm">Column Mapping</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(columnMapping).map(([csvColumn, leadProperty]) => (
                <div key={csvColumn} className="text-sm flex">
                  <span className="font-medium mr-2">{csvColumn}:</span>
                  <span className="text-muted-foreground">{leadProperty}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" className="mr-2" onClick={() => setIsMappingComplete(false)}>
              Back
            </Button>
            <Button onClick={handleImportLeads} disabled={isLoading}>
              {isLoading ? (
                <>
                  <UploadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Import {parsedData.length} Leads
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVImportTab;
