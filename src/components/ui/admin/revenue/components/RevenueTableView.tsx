
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CustomerRevenueRow, MonthColumn } from '@/types/revenue';

// Import our table components
import RevenueTableHeader from './table/RevenueTableHeader';
import RevenueTableLoadingRows from './table/RevenueTableLoadingRows';
import RevenueTableCustomerRow from './table/RevenueTableCustomerRow';
import RevenueTableTotalsRow from './table/RevenueTableTotalsRow';
import RevenueTableEmptyState from './table/RevenueTableEmptyState';

interface RevenueTableViewProps {
  loading: boolean;
  customerRows: CustomerRevenueRow[];
  monthColumns: MonthColumn[];
  monthlyTotals: Record<string, {
    setup_fee: number;
    appointments: number;
    recurring_fee: number;
    total_revenue: number;
  }>;
  handleCellUpdate: (
    customerId: string,
    year: number,
    month: number,
    field: string,
    value: number
  ) => void;
  onCreateSampleData?: () => void;
  updatedFields?: Record<string, string[]>;
  error?: string | null;
}

const RevenueTableView: React.FC<RevenueTableViewProps> = ({
  loading,
  customerRows,
  monthColumns,
  monthlyTotals,
  handleCellUpdate,
  onCreateSampleData,
  updatedFields = {},
  error
}) => {
  // Parse error code from error message if available
  const [errorCode, setErrorCode] = useState<string | null>(null);
  
  useEffect(() => {
    if (error) {
      // Try to extract error code if it's in the format of a database error
      const codeMatch = error.match(/code":\s*"(\d+)"/);
      if (codeMatch && codeMatch[1]) {
        setErrorCode(codeMatch[1]);
      } else {
        setErrorCode(null);
      }
    } else {
      setErrorCode(null);
    }
  }, [error]);
  
  // Add debug logging to help troubleshoot
  console.log('RevenueTableView rendering with:', {
    loading,
    rowCount: customerRows?.length || 0,
    columnCount: monthColumns?.length || 0,
    hasMonthlyTotals: !!monthlyTotals && Object.keys(monthlyTotals).length > 0,
    error
  });

  // Show error above the table if present
  const renderError = () => {
    if (!error) return null;
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler beim Laden der Umsatzdaten</AlertTitle>
        <AlertDescription>
          {errorCode === '23503' 
            ? 'Einige Kundendaten fehlen in der Datenbank. Bitte erstellen Sie zuerst Kundendaten.'
            : 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.'}
        </AlertDescription>
      </Alert>
    );
  };
  
  return (
    <Card className="border rounded-lg">
      <CardContent className="p-0">
        {renderError()}

        <ScrollArea className="h-[calc(100vh-290px)]">
          <div className="overflow-x-auto">
            <Table className="border-collapse whitespace-nowrap">
              {/* Table Header */}
              <RevenueTableHeader monthColumns={monthColumns} />
              
              <TableBody>
                {/* Loading State */}
                {loading && (
                  <RevenueTableLoadingRows monthColumns={monthColumns} />
                )}
                
                {/* Customer Rows */}
                {!loading && customerRows && customerRows.length > 0 && (
                  customerRows.map((row) => (
                    <RevenueTableCustomerRow
                      key={row.customer_id}
                      row={row}
                      monthColumns={monthColumns}
                      handleCellUpdate={handleCellUpdate}
                      updatedFields={updatedFields}
                    />
                  ))
                )}
                
                {/* Empty State */}
                {!loading && (!customerRows || customerRows.length === 0) && (
                  <RevenueTableEmptyState 
                    monthColumns={monthColumns} 
                    onCreateSampleData={onCreateSampleData}
                    error={errorCode}
                  />
                )}

                {/* Totals Row */}
                {!loading && customerRows && customerRows.length > 0 && monthlyTotals && (
                  <RevenueTableTotalsRow
                    monthColumns={monthColumns}
                    monthlyTotals={monthlyTotals}
                    updatedFields={updatedFields}
                  />
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RevenueTableView;
