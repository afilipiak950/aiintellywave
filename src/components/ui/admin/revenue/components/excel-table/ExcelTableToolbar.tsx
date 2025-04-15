
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileDown, Save, Loader2 } from 'lucide-react';

interface ExcelTableToolbarProps {
  addRow: () => void;
  addColumn: () => void;
  exportCsv: () => void;
  isSaving?: boolean;
  hasSyncedData?: boolean;
}

const ExcelTableToolbar: React.FC<ExcelTableToolbarProps> = ({
  addRow,
  addColumn,
  exportCsv,
  isSaving = false,
  hasSyncedData = false
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Button 
          onClick={addRow} 
          variant="outline" 
          size="sm"
          disabled={isSaving}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Row
        </Button>
        <Button 
          onClick={addColumn} 
          variant="outline" 
          size="sm"
          disabled={isSaving}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Column
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        {isSaving ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Saving...
          </div>
        ) : hasSyncedData ? (
          <div className="flex items-center text-sm text-green-600">
            <Save className="h-4 w-4 mr-1" />
            Saved
          </div>
        ) : null}
        
        <Button 
          onClick={exportCsv} 
          variant="outline" 
          size="sm"
          disabled={isSaving}
        >
          <FileDown className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};

export default ExcelTableToolbar;
