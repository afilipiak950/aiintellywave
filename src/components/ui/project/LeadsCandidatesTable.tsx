
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { ScrollArea, ScrollBar } from "../scroll-area";
import { ExcelRow } from '../../../types/project';
import LeadsSearch from './leads/LeadsSearch';
import EditableCell from './leads/EditableCell';
import LeadDetailView from './leads/LeadDetailView';

interface LeadsCandidatesTableProps {
  data: ExcelRow[];
  columns: string[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  canEdit: boolean;
  onCellUpdate: (rowId: string, column: string, value: string) => Promise<void>;
}

const LeadsCandidatesTable = ({
  data,
  columns,
  searchTerm,
  onSearchChange,
  canEdit,
  onCellUpdate
}: LeadsCandidatesTableProps) => {
  const [editingCell, setEditingCell] = useState<{rowId: string, column: string} | null>(null);
  const [selectedLead, setSelectedLead] = useState<ExcelRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    
    return Object.values(row.row_data).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const startEditing = (rowId: string, column: string) => {
    if (!canEdit) return;
    setEditingCell({ rowId, column });
  };
  
  const cancelEditing = () => {
    setEditingCell(null);
  };
  
  const saveEdit = async (value: string) => {
    if (!editingCell) return;
    
    try {
      const { rowId, column } = editingCell;
      await onCellUpdate(rowId, column, value);
      cancelEditing();
    } catch (error) {
    }
  };

  const handleRowClick = (row: ExcelRow) => {
    setSelectedLead(row);
    setIsDetailOpen(true);
  };
  
  return (
    <>
      <LeadsSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
      
      <ScrollArea className="w-full rounded-md border">
        <div className="min-w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map(column => (
                  <TableHead 
                    key={column} 
                    className="font-semibold whitespace-nowrap min-w-[150px]"
                  >
                    <div className="flex items-center">
                      <span>T</span> {column}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow 
                  key={row.id} 
                  className="cursor-pointer hover:bg-muted/60"
                  onClick={() => handleRowClick(row)}
                >
                  {columns.map(column => (
                    <TableCell 
                      key={`${row.id}-${column}`}
                      className="whitespace-nowrap min-w-[150px]"
                      onClick={(e) => {
                        if (canEdit) {
                          e.stopPropagation();
                          startEditing(row.id, column, row.row_data[column]);
                        }
                      }}
                    >
                      <EditableCell 
                        value={row.row_data[column]}
                        isEditing={editingCell?.rowId === row.id && editingCell?.column === column}
                        canEdit={canEdit}
                        onStartEditing={() => startEditing(row.id, column, row.row_data[column])}
                        onSave={saveEdit}
                        onCancel={cancelEditing}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No leads found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      {selectedLead && (
        <LeadDetailView
          lead={selectedLead}
          columns={columns}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          canEdit={canEdit}
        />
      )}
    </>
  );
};

export default LeadsCandidatesTable;
