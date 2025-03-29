
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { importProjectExcelToLeads } from '@/services/excel/excel-lead-import';
import { DatabaseImport, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProjectExcelImportLeadsProps {
  projectId: string;
  excelRowCount: number;
}

const ProjectExcelImportLeads = ({ projectId, excelRowCount }: ProjectExcelImportLeadsProps) => {
  const [importing, setImporting] = useState(false);
  
  const handleImport = async () => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No project ID provided",
        variant: "destructive"
      });
      return;
    }
    
    if (excelRowCount <= 0) {
      toast({
        title: "Warning",
        description: "No Excel data available to import",
        variant: "warning"
      });
      return;
    }
    
    if (confirm(`Are you sure you want to import ${excelRowCount} Excel rows as leads? This action cannot be undone.`)) {
      try {
        setImporting(true);
        const insertedLeads = await importProjectExcelToLeads(projectId);
        console.log(`Imported ${insertedLeads.length} leads`);
      } catch (error) {
        console.error('Error in lead import:', error);
      } finally {
        setImporting(false);
      }
    }
  };
  
  return (
    <Button
      onClick={handleImport}
      variant="secondary"
      size="sm"
      disabled={importing || excelRowCount <= 0}
      className="flex items-center gap-1"
    >
      {importing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
          Importing...
        </>
      ) : (
        <>
          <DatabaseImport className="h-4 w-4 mr-1" />
          Import as Leads ({excelRowCount})
        </>
      )}
    </Button>
  );
};

export default ProjectExcelImportLeads;
