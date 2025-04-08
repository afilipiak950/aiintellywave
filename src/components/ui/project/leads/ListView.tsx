
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../table";
import { ExcelRow } from '../../../../types/project';
import { ScrollArea } from "../../scroll-area";
import EditableCell from './EditableCell';
import ApproveButton from './ApproveButton';
import { Info } from "lucide-react";
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
      {/* Container with fixed height and vertical scroll function */}
      <div className="w-full max-w-full">
        {/* Vertical scroll area for table rows */}
        <ScrollArea className="h-[calc(100vh-350px)] min-h-[300px] max-h-[500px]">
          {/* Table container with horizontal scroll */}
          <div className="overflow-x-auto">
            <Table className="relative w-max min-w-full">
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  {/* Fixed columns */}
                  <TableHead 
                    className="sticky left-0 z-20 w-[80px] font-semibold bg-muted/50 whitespace-nowrap"
                    style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)' }}
                  >
                    Approve
                  </TableHead>
                  <TableHead 
                    className="sticky left-[80px] z-20 w-[180px] font-semibold whitespace-nowrap px-4 py-3 text-left bg-muted/50"
                    style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)' }}
                  >
                    Name
                  </TableHead>
                  
                  {/* Scrollable columns */}
                  {columns.map(column => (
                    <TableHead 
                      key={column} 
                      className="font-semibold whitespace-nowrap px-4 py-3 text-left min-w-[180px]"
                    >
                      {column}
                    </TableHead>
                  ))}
                  
                  {/* Fixed action column on the right */}
                  <TableHead 
                    className="sticky right-0 z-20 w-[100px] text-center font-semibold bg-muted/50"
                    style={{ boxShadow: '-2px 0 5px -2px rgba(0,0,0,0.1)' }}
                  >
                    Actions
                  </TableHead>
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
                      {/* Fixed Approve column */}
                      <TableCell 
                        className="sticky left-0 z-20 w-[80px] p-2 bg-white dark:bg-gray-900"
                        style={{
                          backgroundColor: isApproved ? 'rgb(240 253 244 / 1)' : '',
                          boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                          <ApproveButton 
                            isApproved={isApproved}
                            onApprove={() => onApprove(row.id)}
                            isLoading={isUpdatingApproval}
                          />
                        </div>
                      </TableCell>
                      
                      {/* Fixed Name column */}
                      <TableCell 
                        className="sticky left-[80px] z-20 w-[180px] whitespace-nowrap py-3 bg-white dark:bg-gray-900"
                        onClick={() => onLeadClick(row)}
                        style={{
                          backgroundColor: isApproved ? 'rgb(240 253 244 / 1)' : '',
                          boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div className="px-2 font-medium">
                          {name}
                        </div>
                      </TableCell>
                      
                      {/* Scrollable data columns */}
                      {columns.map(column => (
                        <TableCell 
                          key={`${row.id}-${column}`}
                          className="whitespace-nowrap py-3 min-w-[180px]"
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
                      
                      {/* Fixed action column on the right */}
                      <TableCell 
                        className="sticky right-0 z-20 w-[100px] text-center bg-white dark:bg-gray-900"
                        style={{
                          backgroundColor: isApproved ? 'rgb(240 253 244 / 1)' : '',
                          boxShadow: '-2px 0 5px -2px rgba(0,0,0,0.1)'
                        }}
                      >
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
