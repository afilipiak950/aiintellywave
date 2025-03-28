
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { ScrollArea } from "../scroll-area";
import { ExcelRow } from '../../../types/project';
import LeadsSearch from './leads/LeadsSearch';
import LeadDetailView from './leads/LeadDetailView';
import { useIsMobile } from "../../../hooks/use-mobile";
import ViewToggle from './leads/ViewToggle';
import ListView from './leads/ListView';
import TileView from './leads/TileView';
import { useLeadsTable } from '../../../hooks/use-leads-table';

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
  const isMobile = useIsMobile();

  const {
    filteredData,
    editingCell,
    selectedLead,
    isDetailOpen,
    viewMode,
    approvedLeads,
    startEditing,
    cancelEditing,
    saveEdit,
    handleRowClick,
    handleApprove,
    setViewMode,
    setIsDetailOpen,
    visibleColumns
  } = useLeadsTable({
    data,
    canEdit,
    onCellUpdate,
    columns
  });
  
  return (
    <Card className="shadow-md w-full border rounded-lg overflow-hidden">
      <CardHeader className="pb-3 border-b bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle className="text-lg font-medium text-slate-800 dark:text-slate-200">
            Leads & Candidates
          </CardTitle>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
        <LeadsSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
      </CardHeader>
      <CardContent className="p-0">
        {/* Main content container - fixed width with overflow handling */}
        <div className="relative w-full border-t border-border/30">
          {viewMode === 'tile' ? (
            <div className="max-w-full">
              <ScrollArea className="h-auto max-h-[calc(100vh-250px)]">
                <TileView 
                  data={filteredData}
                  approvedLeads={approvedLeads}
                  onApprove={handleApprove}
                  onLeadClick={handleRowClick}
                />
              </ScrollArea>
            </div>
          ) : (
            <div className="w-full overflow-hidden border-t border-border/30">
              <ListView 
                data={filteredData}
                columns={visibleColumns}
                allColumns={columns}
                approvedLeads={approvedLeads}
                editingCell={editingCell}
                canEdit={canEdit}
                onApprove={handleApprove}
                onLeadClick={handleRowClick}
                onStartEditing={startEditing}
                onSaveEdit={saveEdit}
                onCancelEditing={cancelEditing}
              />
            </div>
          )}
        </div>
      </CardContent>
      
      {selectedLead && (
        <LeadDetailView
          lead={selectedLead}
          columns={columns}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          canEdit={canEdit}
          onApprove={handleApprove}
        />
      )}
    </Card>
  );
};

export default LeadsCandidatesTable;
