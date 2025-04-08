
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
  return (
    <div className="relative rounded-md shadow-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full">
      {/* Wichtig: Container mit fester Breite, der verhindert, dass sich die Seitenbreite ausdehnt */}
      <div className="w-full overflow-hidden">
        {/* Vertikaler Scrollbereich für Tabellenzeilen */}
        <ScrollArea className="h-[calc(100vh-350px)] min-h-[300px] max-h-[500px]">
          {/* Horizontaler Scrollcontainer NUR für den Tabelleninhalt */}
          <div className="overflow-x-auto">
            <Table className="relative w-max min-w-full">
              <TableHeader columns={columns} />
              <TableBody>
                {data.length > 0 ? (
                  data.map((row) => (
                    <LeadRow
                      key={row.id}
                      row={row}
                      isApproved={approvedLeads.has(row.id)}
                      editingCell={editingCell}
                      canEdit={canEdit}
                      columns={columns}
                      onApprove={onApprove}
                      onLeadClick={onLeadClick}
                      onStartEditing={onStartEditing}
                      onSaveEdit={onSaveEdit}
                      onCancelEditing={onCancelEditing}
                      isUpdatingApproval={isUpdatingApproval}
                    />
                  ))
                ) : (
                  <EmptyState columnsCount={columns.length} />
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
