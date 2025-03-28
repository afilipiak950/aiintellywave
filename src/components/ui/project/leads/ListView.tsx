
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../table";
import { ExcelRow } from '../../../../types/project';
import { ScrollArea } from "../../scroll-area";
import EditableCell from './EditableCell';
import ApproveButton from './ApproveButton';

interface ListViewProps {
  data: ExcelRow[];
  columns: string[];
  approvedLeads: Set<string>;
  editingCell: { rowId: string, column: string } | null;
  canEdit: boolean;
  onApprove: (id: string) => void;
  onLeadClick: (lead: ExcelRow) => void;
  onStartEditing: (rowId: string, column: string) => void;
  onSaveEdit: (value: string) => void;
  onCancelEditing: () => void;
}

const ListView = ({
  data,
  columns,
  approvedLeads,
  editingCell,
  canEdit,
  onApprove,
  onLeadClick,
  onStartEditing,
  onSaveEdit,
  onCancelEditing
}: ListViewProps) => {
  return (
    <div className="border rounded-md shadow-sm bg-white dark:bg-gray-900">
      <div className="w-full">
        <ScrollArea className="h-[calc(100vh-350px)] min-h-[300px] max-h-[500px]">
          <div className="min-w-max">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[80px] font-semibold">Approve</TableHead>
                  {columns.map(column => (
                    <TableHead 
                      key={column} 
                      className="font-semibold whitespace-nowrap px-4 py-3 text-left"
                    >
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => {
                  const isApproved = approvedLeads.has(row.id);
                  
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
                          />
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
                    </TableRow>
                  );
                })}
                
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className="h-24 text-center">
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
