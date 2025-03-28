
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { ScrollArea } from "../scroll-area";
import { ExcelRow } from '../../../types/project';
import LeadsSearch from './leads/LeadsSearch';
import EditableCell from './leads/EditableCell';
import LeadDetailView from './leads/LeadDetailView';
import { useIsMobile } from "../../../hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
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
      console.error('Error saving edit:', error);
    }
  };

  const handleRowClick = (row: ExcelRow) => {
    setSelectedLead(row);
    setIsDetailOpen(true);
  };
  
  // Card view for both mobile and desktop
  const renderCardView = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pb-4">
        {filteredData.length === 0 && (
          <div className="col-span-full text-center py-8 border rounded-md bg-muted/10">
            No leads found matching your search criteria.
          </div>
        )}
        
        {filteredData.map((row) => (
          <Card 
            key={row.id}
            className="cursor-pointer hover:bg-muted/20 transition-colors h-full" 
            onClick={() => handleRowClick(row)}
          >
            <CardContent className="p-4">
              {columns.slice(0, 5).map(column => (
                <div key={column} className="py-1.5">
                  <div className="text-xs text-muted-foreground font-medium">{column}</div>
                  <div className="font-medium truncate" onClick={(e) => {
                    if (canEdit) {
                      e.stopPropagation();
                      startEditing(row.id, column);
                    }
                  }}>
                    <EditableCell 
                      value={row.row_data[column]}
                      isEditing={editingCell?.rowId === row.id && editingCell?.column === column}
                      canEdit={canEdit}
                      onStartEditing={() => startEditing(row.id, column)}
                      onSave={saveEdit}
                      onCancel={cancelEditing}
                    />
                  </div>
                </div>
              ))}
              {columns.length > 5 && (
                <div className="text-sm text-primary mt-2 font-medium">
                  + {columns.length - 5} more fields
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Table view for larger screens when preferred
  const renderTableView = () => {
    return (
      <div className="border rounded-md overflow-hidden">
        <ScrollArea className="h-[calc(100vh-350px)] min-h-[300px] max-h-[500px]">
          <div className="min-w-full">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow className="bg-muted/50">
                  {columns.map(column => (
                    <TableHead 
                      key={column} 
                      className="font-semibold whitespace-nowrap px-4 py-3"
                    >
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row) => (
                  <TableRow 
                    key={row.id} 
                    className="cursor-pointer hover:bg-muted/60 border-b"
                    onClick={() => handleRowClick(row)}
                  >
                    {columns.map(column => (
                      <TableCell 
                        key={`${row.id}-${column}`}
                        className="whitespace-nowrap"
                        onClick={(e) => {
                          if (canEdit) {
                            e.stopPropagation();
                            startEditing(row.id, column);
                          }
                        }}
                      >
                        <EditableCell 
                          value={row.row_data[column]}
                          isEditing={editingCell?.rowId === row.id && editingCell?.column === column}
                          canEdit={canEdit}
                          onStartEditing={() => startEditing(row.id, column)}
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
        </ScrollArea>
      </div>
    );
  };
  
  return (
    <Card className="shadow-sm overflow-hidden w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Leads & Candidates</CardTitle>
        <LeadsSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-auto max-h-[calc(100vh-250px)]">
          {renderCardView()}
        </ScrollArea>
      </CardContent>
      
      {selectedLead && (
        <LeadDetailView
          lead={selectedLead}
          columns={columns}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          canEdit={canEdit}
        />
      )}
    </Card>
  );
};

export default LeadsCandidatesTable;
