
import { useState } from 'react';
import { Search, Edit, Save, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { Input } from "../input";
import { Button } from "../button";
import { ExcelRow } from '../../../types/project';

interface ProjectExcelTableProps {
  data: ExcelRow[];
  columns: string[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  canEdit: boolean;
  onCellUpdate: (rowId: string, column: string, value: string) => Promise<void>;
}

const ProjectExcelTable = ({
  data,
  columns,
  searchTerm,
  onSearchChange,
  canEdit,
  onCellUpdate
}: ProjectExcelTableProps) => {
  const [editingCell, setEditingCell] = useState<{rowId: string, column: string} | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Filter data based on search term
  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    
    // Search in all columns
    return Object.values(row.row_data).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const startEditing = (rowId: string, column: string, value: any) => {
    if (!canEdit) return;
    setEditingCell({ rowId, column });
    setEditValue(value?.toString() || '');
  };
  
  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue('');
  };
  
  const saveEdit = async () => {
    if (!editingCell) return;
    
    try {
      const { rowId, column } = editingCell;
      await onCellUpdate(rowId, column, editValue);
      cancelEditing();
    } catch (error) {
      // Error is handled in the onCellUpdate function
    }
  };
  
  return (
    <>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Search data..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Row</TableHead>
                {columns.map(column => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.row_number}</TableCell>
                  {columns.map(column => (
                    <TableCell key={`${row.id}-${column}`}>
                      {editingCell && editingCell.rowId === row.id && editingCell.column === column ? (
                        <div className="flex items-center space-x-1">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="py-1 h-8"
                          />
                          <Button size="sm" variant="ghost" onClick={saveEdit}>
                            <Save size={16} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEditing}>
                            <X size={16} />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className={`${canEdit ? 'cursor-pointer group relative' : ''}`}
                          onClick={() => canEdit && startEditing(row.id, column, row.row_data[column])}
                        >
                          {row.row_data[column]?.toString() || ''}
                          {canEdit && (
                            <Edit size={14} className="invisible group-hover:visible absolute top-1/2 right-0 transform -translate-y-1/2 text-gray-400" />
                          )}
                        </div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default ProjectExcelTable;
