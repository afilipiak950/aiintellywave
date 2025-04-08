
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../table";
import { ExcelRow } from '../../../../types/project';
import { ScrollArea } from "../../scroll-area";
import EditableCell from './EditableCell';
import ApproveButton from './ApproveButton';
import { Info, ChevronRight } from "lucide-react";
import { Button } from "../../button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../tooltip";

interface ListViewProps {
  data: ExcelRow[];
  columns: string[];
  allColumns: string[];
  approvedLeads: Set<string>;
  editingCell: { rowId: string, column: string } | null;
  canEdit: boolean;
  onApprove: (id: string) => void;
  onLeadClick: (lead: ExcelRow) => void;
  onStartEditing: (rowId: string, column: string) => void;
  onSaveEdit: (value: string) => void;
  onCancelEditing: () => void;
  isUpdatingApproval?: boolean;
}

const ListView = ({
  data,
  columns,
  allColumns,
  approvedLeads,
  editingCell,
  canEdit,
  onApprove,
  onLeadClick,
  onStartEditing,
  onSaveEdit,
  onCancelEditing,
  isUpdatingApproval = false
}: ListViewProps) => {
  // Helper function to get a name from row data
  const getNameFromRowData = (rowData: Record<string, any>): string => {
    // Try common name field variations
    for (const field of ['Name', 'name', 'Full Name', 'full_name', 'FullName', 'fullName']) {
      if (rowData[field]) return rowData[field];
    }
    
    // Try to compose name from first and last name
    const firstName = rowData['First Name'] || rowData['first_name'] || rowData['FirstName'] || '';
    const lastName = rowData['Last Name'] || rowData['last_name'] || rowData['LastName'] || '';
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return 'Unknown';
  };

  return (
    <div className="relative rounded-md shadow-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      {/* Container with fixed width and scrollable overflow */}
      <div className="w-full max-w-full">
        {/* Vertical scroll area for the table rows */}
        <ScrollArea className="h-[calc(100vh-350px)] min-h-[300px] max-h-[500px]">
          {/* Horizontal scroll container */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[80px] font-semibold">Approve</TableHead>
                  <TableHead className="w-[180px] font-semibold whitespace-nowrap px-4 py-3 text-left">Name</TableHead>
                  {columns.map(column => (
                    <TableHead 
                      key={column} 
                      className="font-semibold whitespace-nowrap px-4 py-3 text-left"
                    >
                      {column}
                    </TableHead>
                  ))}
                  <TableHead className="w-[100px] text-center font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => {
                  const isApproved = approvedLeads.has(row.id);
                  const name = getNameFromRowData(row.row_data);
                  
                  return (
                    <TableRow 
                      key={row.id} 
                      className={`hover:bg-muted/60 border-b transition-colors ${isApproved ? 'bg-green-50 dark:bg-green-950/20' : ''}`}
                    >
                      <TableCell className="w-[80px] p-2">
                        <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                          <ApproveButton 
                            isApproved={isApproved}
                            onApprove={() => onApprove(row.id)}
                            isLoading={isUpdatingApproval}
                          />
                        </div>
                      </TableCell>
                      <TableCell 
                        className="w-[180px] whitespace-nowrap py-3"
                        onClick={() => onLeadClick(row)}
                      >
                        <div className="px-2 font-medium">
                          {name}
                        </div>
                      </TableCell>
                      {columns.map(column => (
                        <TableCell 
                          key={`${row.id}-${column}`}
                          className="whitespace-nowrap py-3"
                          onClick={() => onLeadClick(row)}
                        >
                          <div
                            onClick={(e) => {
                              if (canEdit) {
                                e.stopPropagation();
                                onStartEditing(row.id, column);
                              }
                            }}
                            className="px-2"
                          >
                            <EditableCell 
                              value={row.row_data[column]}
                              isEditing={editingCell?.rowId === row.id && editingCell?.column === column}
                              canEdit={canEdit}
                              onStartEditing={() => onStartEditing(row.id, column)}
                              onSave={onSaveEdit}
                              onCancel={onCancelEditing}
                            />
                          </div>
                        </TableCell>
                      ))}
                      <TableCell className="w-[100px] text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-0 h-8 w-8"
                                onClick={() => onLeadClick(row)}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View all details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  );
                })}
                
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columns.length + 3} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 py-6">
                        <p className="text-gray-500 text-lg">No leads found matching your search criteria.</p>
                        <p className="text-gray-400 text-sm">Try adjusting your search parameters.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ListView;
