
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { ScrollArea } from "../scroll-area";
import { ExcelRow } from '../../../types/project';
import LeadsSearch from './leads/LeadsSearch';
import EditableCell from './leads/EditableCell';
import LeadDetailView from './leads/LeadDetailView';
import { useIsMobile } from "../../../hooks/use-mobile";
import { Button } from '../button';
import { Check, Grid, List, ListFilter, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import ApproveButton from './leads/ApproveButton';

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
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('tile');
  const [approvedLeads, setApprovedLeads] = useState<Set<string>>(new Set());
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

  const handleApprove = (id: string) => {
    setApprovedLeads(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const getImportantFields = (row: ExcelRow) => {
    const priorityFields = ['Name', 'Company', 'Title', 'Email', 'Phone', 'City', 'State'];
    const displayFields: Record<string, any> = {};
    
    // First add priority fields if they exist
    priorityFields.forEach(field => {
      const matchedField = Object.keys(row.row_data).find(
        key => key.toLowerCase() === field.toLowerCase()
      );
      
      if (matchedField && row.row_data[matchedField]) {
        displayFields[matchedField] = row.row_data[matchedField];
      }
    });
    
    // Add any other fields if we don't have enough
    if (Object.keys(displayFields).length < 5) {
      Object.entries(row.row_data).forEach(([key, value]) => {
        if (!Object.keys(displayFields).includes(key) && value && Object.keys(displayFields).length < 5) {
          displayFields[key] = value;
        }
      });
    }
    
    return displayFields;
  };

  const getCardBackground = (index: number) => {
    const backgrounds = [
      'bg-gradient-to-tr from-blue-50 to-indigo-50',
      'bg-gradient-to-tr from-purple-50 to-pink-50',
      'bg-gradient-to-tr from-emerald-50 to-teal-50',
      'bg-gradient-to-tr from-amber-50 to-yellow-50'
    ];
    
    return backgrounds[index % backgrounds.length];
  };
  
  // Tile view for modern, visually appealing cards
  const renderTileView = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 pb-4">
        {filteredData.length === 0 && (
          <div className="col-span-full text-center py-8 border rounded-md bg-muted/10">
            No leads found matching your search criteria.
          </div>
        )}
        
        {filteredData.map((row, index) => {
          const isApproved = approvedLeads.has(row.id);
          const importantFields = getImportantFields(row);
          const fieldKeys = Object.keys(importantFields);
          const hasMoreFields = Object.keys(row.row_data).length > fieldKeys.length;
          
          return (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="h-full"
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 h-full border overflow-hidden ${getCardBackground(index)} ${isApproved ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
              >
                <div className="absolute top-3 right-3 z-10">
                  <ApproveButton 
                    isApproved={isApproved}
                    onApprove={(e) => {
                      e.stopPropagation();
                      handleApprove(row.id);
                    }}
                  />
                </div>
                
                <div 
                  className="p-4 h-full flex flex-col"
                  onClick={() => handleRowClick(row)}
                >
                  {fieldKeys.length > 0 && (
                    <div className="font-medium text-lg mb-2 truncate">
                      {importantFields[fieldKeys[0]]}
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm flex-1">
                    {fieldKeys.slice(1).map((key, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-xs text-muted-foreground capitalize">{key}</span>
                        <span className="truncate">{importantFields[key]}</span>
                      </div>
                    ))}
                  </div>
                  
                  {hasMoreFields && (
                    <div className="mt-4 pt-2 border-t border-border/50">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="w-full text-xs text-primary flex items-center justify-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row);
                        }}
                      >
                        <MoreHorizontal size={14} />
                        {Object.keys(row.row_data).length - fieldKeys.length} more fields
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };
  
  // List view for structured table data
  const renderListView = () => {
    return (
      <div className="border rounded-md overflow-hidden">
        <ScrollArea className="h-[calc(100vh-350px)] min-h-[300px] max-h-[500px]">
          <div className="min-w-full">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[80px]">Approve</TableHead>
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
                {filteredData.map((row) => {
                  const isApproved = approvedLeads.has(row.id);
                  
                  return (
                    <TableRow 
                      key={row.id} 
                      className={`hover:bg-muted/60 border-b transition-colors ${isApproved ? 'bg-green-50 dark:bg-green-950/20' : ''}`}
                    >
                      <TableCell className="w-[80px]">
                        <div onClick={(e) => e.stopPropagation()}>
                          <ApproveButton 
                            isApproved={isApproved}
                            onApprove={() => handleApprove(row.id)}
                          />
                        </div>
                      </TableCell>
                      {columns.map(column => (
                        <TableCell 
                          key={`${row.id}-${column}`}
                          className="whitespace-nowrap"
                          onClick={() => handleRowClick(row)}
                        >
                          <div
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
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
                
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className="h-24 text-center">
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
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Leads & Candidates</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'tile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('tile')}
              className="flex gap-1"
            >
              <Grid size={16} />
              <span className="hidden sm:inline">Tiles</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex gap-1"
            >
              <List size={16} />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
        </div>
        <LeadsSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-auto max-h-[calc(100vh-250px)]">
          {viewMode === 'tile' ? renderTileView() : renderListView()}
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
