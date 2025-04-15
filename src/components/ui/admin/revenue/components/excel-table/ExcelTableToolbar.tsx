
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileDown, Save, Loader2, RotateCw } from 'lucide-react';

interface ExcelTableToolbarProps {
  addRow: () => void;
  addColumn: () => void;
  exportCsv: () => void;
  refreshData?: () => void;
  isSaving?: boolean;
  hasSyncedData?: boolean;
  isLoading?: boolean;
}

const ExcelTableToolbar: React.FC<ExcelTableToolbarProps> = ({
  addRow,
  addColumn,
  exportCsv,
  refreshData,
  isSaving = false,
  hasSyncedData = false,
  isLoading = false
}) => {
  // Disable all interactions during loading or saving
  const isDisabled = isSaving || isLoading;
  
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Button 
          onClick={addRow} 
          variant="outline" 
          size="sm"
          disabled={isDisabled}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Zeile hinzufügen
        </Button>
        <Button 
          onClick={addColumn} 
          variant="outline" 
          size="sm"
          disabled={isDisabled}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Spalte hinzufügen
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        {isSaving ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Speichern...
          </div>
        ) : isLoading ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Laden...
          </div>
        ) : hasSyncedData ? (
          <div className="flex items-center text-sm text-green-600">
            <Save className="h-4 w-4 mr-1" />
            Gespeichert
          </div>
        ) : null}
        
        {refreshData && (
          <Button 
            onClick={refreshData} 
            variant="outline" 
            size="sm"
            disabled={isDisabled}
            title="Daten aktualisieren"
          >
            <RotateCw className="h-4 w-4 mr-1" />
            Aktualisieren
          </Button>
        )}
        
        <Button 
          onClick={exportCsv} 
          variant="outline" 
          size="sm"
          disabled={isDisabled}
        >
          <FileDown className="h-4 w-4 mr-1" />
          Als CSV exportieren
        </Button>
      </div>
    </div>
  );
};

export default ExcelTableToolbar;
