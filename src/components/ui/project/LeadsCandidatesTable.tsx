
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { ScrollArea } from "../scroll-area";
import { ExcelRow } from '../../../types/project';
import LeadsSearch from './leads/LeadsSearch';
import LeadDetailView from './leads/LeadDetailView';
import { useIsMobile } from "../../../hooks/use-mobile";
import ListView from './leads/ListView';
import { useLeadsTable } from '../../../hooks/use-leads-table';

interface LeadsCandidatesTableProps {
  data: ExcelRow[];
  columns: string[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  canEdit: boolean;
  onCellUpdate: (rowId: string, column: string, value: string) => Promise<void>;
  projectId: string;
}

const LeadsCandidatesTable = ({
  data,
  columns,
  searchTerm,
  onSearchChange,
  canEdit,
  onCellUpdate,
  projectId
}: LeadsCandidatesTableProps) => {
  const isMobile = useIsMobile();

  const {
    filteredData,
    editingCell,
    selectedLead,
    isDetailOpen,
    approvedLeads,
    startEditing,
    cancelEditing,
    saveEdit,
    handleRowClick,
    handleApprove,
    setIsDetailOpen,
    visibleColumns,
    isUpdatingApproval
  } = useLeadsTable({
    data,
    canEdit,
    onCellUpdate,
    columns,
    projectId
  });
  
  return (
    <Card className="shadow-md w-full border rounded-lg overflow-hidden">
      <CardHeader className="pb-3 border-b bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle className="text-lg font-medium text-slate-800 dark:text-slate-200">
            Leads & Candidates
          </CardTitle>
        </div>
        <LeadsSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full border-t border-border/30">
          <div className="w-full overflow-hidden border-t border-border/30">
            <ListView 
              data={filteredData}
              columns={columns}
              allColumns={columns}
              approvedLeads={approvedLeads}
              editingCell={editingCell}
              canEdit={canEdit}
              onApprove={handleApprove}
              onLeadClick={handleRowClick}
              onStartEditing={startEditing}
              onSaveEdit={saveEdit}
              onCancelEditing={cancelEditing}
              isUpdatingApproval={isUpdatingApproval}
            />
          </div>
        </div>
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
