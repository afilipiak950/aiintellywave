
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { MonthColumn } from '@/types/revenue';
import { AlertCircle, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RevenueTableEmptyStateProps {
  monthColumns: MonthColumn[];
  onCreateSampleData?: () => void;
  error?: string | null;
}

const RevenueTableEmptyState: React.FC<RevenueTableEmptyStateProps> = ({
  monthColumns,
  onCreateSampleData,
  error
}) => {
  return (
    <TableRow>
      <TableCell 
        colSpan={monthColumns.length + 2}
        className="h-32 text-center"
      >
        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground p-6">
          {error ? (
            <>
              <AlertCircle className="h-8 w-8 text-amber-500" />
              <p className="font-medium">Fehler beim Laden der Umsatzdaten</p>
              <p className="text-sm max-w-md">
                {error === '23503' ? 
                  'Einige Kundendaten fehlen in der Datenbank. Bitte erstellen Sie zuerst Kundendaten oder prüfen Sie die Datenbankverbindung.' : 
                  'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.'}
              </p>
            </>
          ) : (
            <>
              <PlusCircle className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">Keine Umsatzdaten vorhanden</p>
              <p className="text-sm">Erstellen Sie Beispieldaten oder synchronisieren Sie Kunden mit der Schaltfläche oben.</p>
              
              {onCreateSampleData && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onCreateSampleData}
                  className="mt-2"
                >
                  Beispieldaten erstellen
                </Button>
              )}
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RevenueTableEmptyState;
