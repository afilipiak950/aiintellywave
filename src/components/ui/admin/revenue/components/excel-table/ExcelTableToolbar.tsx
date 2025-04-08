
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Save } from 'lucide-react';
import { exportTableToCsv } from '../table-utils/exportUtils';

interface ExcelTableToolbarProps {
  addRow: () => void;
  addColumn: () => void;
  exportCsv: () => void;
}

const ExcelTableToolbar: React.FC<ExcelTableToolbarProps> = ({
  addRow,
  addColumn,
  exportCsv
}) => {
  return (
    <div className="flex justify-between mb-4">
      <div className="space-x-2">
        <Button onClick={addRow} variant="outline" size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          <span>Add Row</span>
        </Button>
        <Button onClick={addColumn} variant="outline" size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          <span>Add Column</span>
        </Button>
      </div>
      <div className="space-x-2">
        <Button onClick={exportCsv} variant="outline" size="sm" className="gap-1">
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          <Save className="h-4 w-4" />
          <span>Save</span>
        </Button>
      </div>
    </div>
  );
};

export default ExcelTableToolbar;
