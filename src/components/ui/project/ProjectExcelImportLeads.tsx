
import { useState } from 'react';
import { Button } from '../button';
import { toast } from '../../../hooks/use-toast';
import { importProjectExcelToLeads } from '../../../services/excel/excel-lead-import';
import { ArrowRightLeft } from 'lucide-react';

interface ProjectExcelImportLeadsProps {
  projectId: string;
  rowCount: number;
  onSuccess?: () => void;  // Callback function for when import is successful
}

const ProjectExcelImportLeads = ({ projectId, rowCount, onSuccess }: ProjectExcelImportLeadsProps) => {
  const [importing, setImporting] = useState(false);

  const handleImportToLeads = async () => {
    try {
      if (!confirm(`Are you sure you want to import ${rowCount} Excel rows as leads? This action cannot be undone.`)) {
        return;
      }

      setImporting(true);
      console.log(`Starting import of ${rowCount} rows from project ${projectId}`);
      const importedIds = await importProjectExcelToLeads(projectId);
      
      console.log(`Import complete. ${importedIds.length} leads imported`);
      
      if (importedIds.length > 0) {
        toast({
          title: "Success",
          description: `Successfully imported ${importedIds.length} Excel rows as leads.`,
          variant: "default"
        });
        
        // Call the success callback if provided to refresh the lead display
        if (onSuccess && typeof onSuccess === 'function') {
          console.log('Calling onSuccess callback to refresh leads after import');
          onSuccess();
        }
      } else {
        toast({
          title: "Warning",
          description: "No leads were imported. Please check the console for details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error importing Excel data as leads:', error);
      toast({
        title: "Error",
        description: "Failed to import Excel data as leads. See console for details.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  if (rowCount <= 0) {
    return null;
  }

  return (
    <Button 
      variant="secondary" 
      size="sm" 
      onClick={handleImportToLeads}
      disabled={importing}
      className="ml-2 bg-green-100 hover:bg-green-200 text-green-800"
    >
      {importing ? (
        <>
          <span className="animate-spin mr-2">⟳</span>
          Importing...
        </>
      ) : (
        <>
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Import {rowCount} as Leads
        </>
      )}
    </Button>
  );
};

export default ProjectExcelImportLeads;
