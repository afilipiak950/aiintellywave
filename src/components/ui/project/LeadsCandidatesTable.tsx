
import { useState } from 'react';
import { Search, ChevronRight, X, Save, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { Input } from "../input";
import { Button } from "../button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../dialog";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../resizable";
import { ExcelRow } from '../../../types/project';

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
  const [editValue, setEditValue] = useState('');
  const [selectedLead, setSelectedLead] = useState<ExcelRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
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

  const handleRowClick = (row: ExcelRow) => {
    setSelectedLead(row);
    setIsDetailOpen(true);
  };
  
  return (
    <>
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map(column => (
                  <TableHead key={column} className="font-semibold whitespace-nowrap">
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
                      className="whitespace-nowrap"
                      onClick={(e) => {
                        if (canEdit) {
                          e.stopPropagation();
                          startEditing(row.id, column, row.row_data[column]);
                        }
                      }}
                    >
                      {editingCell && editingCell.rowId === row.id && editingCell.column === column ? (
                        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="py-1 h-8"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button size="sm" variant="ghost" onClick={(e) => {
                            e.stopPropagation();
                            saveEdit();
                          }}>
                            <Save size={16} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={(e) => {
                            e.stopPropagation();
                            cancelEditing();
                          }}>
                            <X size={16} />
                          </Button>
                        </div>
                      ) : (
                        <div className={`${canEdit ? 'group relative' : ''} truncate max-w-xs`}>
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No leads found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {selectedLead && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lead/Candidate Details</DialogTitle>
            </DialogHeader>
            
            <ResizablePanelGroup direction="horizontal" className="min-h-[400px]">
              <ResizablePanel defaultSize={30}>
                <div className="p-4 space-y-2 font-medium">
                  {columns.map((column) => (
                    <div key={column} className="cursor-pointer p-2 rounded hover:bg-muted">
                      {column}
                    </div>
                  ))}
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              <ResizablePanel defaultSize={70}>
                <div className="p-6 space-y-6">
                  {Object.entries(selectedLead.row_data).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">{key}</h3>
                      <p className="text-lg">{value?.toString() || 'N/A'}</p>
                      <div className="border-t border-border pt-2"></div>
                    </div>
                  ))}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
            
            <DialogFooter>
              <Button onClick={() => setIsDetailOpen(false)}>Close</Button>
              {canEdit && (
                <Button variant="outline">
                  Convert to Lead
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default LeadsCandidatesTable;
