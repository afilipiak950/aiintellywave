
import React from 'react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import ExcelEditableCell from '../ExcelEditableCell';

interface ExcelTableRowsProps {
  rowLabels: string[];
  columns: string[];
  data: Record<string, Record<string, string>>;
  rowTotals: Record<string, number>;
  columnTotals: Record<string, number>;
  handleCellChange: (row: string, col: string, value: string) => void;
  handleRowLabelChange: (oldLabel: string, newLabel: string) => void;
}

const ExcelTableRows: React.FC<ExcelTableRowsProps> = ({
  rowLabels,
  columns,
  data,
  rowTotals,
  columnTotals,
  handleCellChange,
  handleRowLabelChange
}) => {
  return (
    <TableBody>
      {rowLabels.map(row => (
        <TableRow key={row} className="h-10">
          <TableCell className="p-0 sticky left-0">
            <ExcelEditableCell
              value={row}
              onChange={(newLabel) => handleRowLabelChange(row, newLabel)}
              isHeader={true}
              isCurrency={false}
            />
          </TableCell>
          {columns.map(col => (
            <TableCell key={`${row}-${col}`} className="p-0 border">
              <ExcelEditableCell
                value={data[row]?.[col] || ''}
                onChange={(value) => handleCellChange(row, col, value)}
              />
            </TableCell>
          ))}
          <TableCell className="p-0 border bg-muted/10">
            <ExcelEditableCell
              value={rowTotals[row] || 0}
              onChange={() => {}} // Read-only, can't edit totals
              isHeader={true}
              readOnly={true}
              isTotal={true}
            />
          </TableCell>
        </TableRow>
      ))}
      <TableRow className="h-10 bg-muted/10 font-bold">
        <TableCell className="p-0 sticky left-0">
          <ExcelEditableCell
            value="Total"
            onChange={() => {}} // Read-only
            isHeader={true}
            readOnly={true}
            isCurrency={false}
          />
        </TableCell>
        {columns.map(col => (
          <TableCell key={`total-${col}`} className="p-0 border">
            <ExcelEditableCell
              value={columnTotals[col] || 0}
              onChange={() => {}} // Read-only
              isHeader={true}
              readOnly={true}
              isTotal={true}
            />
          </TableCell>
        ))}
        <TableCell className="p-0 border bg-muted/30">
          <ExcelEditableCell
            value={columnTotals['grand'] || 0}
            onChange={() => {}} // Read-only
            isHeader={true}
            readOnly={true}
            isTotal={true}
          />
        </TableCell>
      </TableRow>
    </TableBody>
  );
};

export default ExcelTableRows;
