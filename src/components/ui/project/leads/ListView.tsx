
import { Table, TableBody } from "../../table";
import { ExcelRow } from '../../../../types/project';
import { ScrollArea } from "../../scroll-area";
import TableHeader from './TableHeader';
import LeadRow from './LeadRow';
import EmptyState from './EmptyState';

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
  // Limit visible columns to 6 (or less if there are fewer columns)
  const displayColumns = columns.slice(0, 3); // Show only 3 data columns (plus fixed Name, Approve, and Actions columns = 6 total)
  
  return (
    <div className="relative rounded-md shadow-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full">
      <div className="w-full">
        {/* Vertical scroll area for table rows */}
        <ScrollArea className="h-[calc(100vh-350px)] min-h-[300px] max-h-[500px]">
          {/* Horizontal scroll container ONLY for table content */}
          <div className="overflow-x-auto">
            <Table className="w-max min-w-full table-fixed">
              <TableHeader columns={displayColumns} allColumns={columns} />
              <TableBody>
                {data.length > 0 ? (
                  data.map((row) => (
                    <LeadRow
                      key={row.id}
                      row={row}
                      isApproved={approvedLeads.has(row.id)}
                      editingCell={editingCell}
                      canEdit={canEdit}
                      columns={displayColumns}
                      allColumns={columns}
                      onApprove={onApprove}
                      onLeadClick={onLeadClick}
                      onStartEditing={onStartEditing}
                      onSaveEdit={onSaveEdit}
                      onCancelEditing={onCancelEditing}
                      isUpdatingApproval={isUpdatingApproval}
                    />
                  ))
                ) : (
                  <EmptyState columnsCount={displayColumns.length} />
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
