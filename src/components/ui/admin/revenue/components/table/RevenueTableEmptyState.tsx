
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { MonthColumn } from '@/types/revenue';

interface RevenueTableEmptyStateProps {
  monthColumns: MonthColumn[];
}

const RevenueTableEmptyState: React.FC<RevenueTableEmptyStateProps> = ({
  monthColumns
}) => {
  return (
    <TableRow>
      <TableCell 
        colSpan={monthColumns.length + 2}
        className="h-24 text-center"
      >
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <p>Keine Umsatzdaten vorhanden</p>
          <p className="text-sm">Erstellen Sie Beispieldaten oder synchronisieren Sie Kunden mit der Schaltfläche oben.</p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RevenueTableEmptyState;
