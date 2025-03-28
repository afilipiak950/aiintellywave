
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
    setIsDetailOpen
  } = useLeadsTable({
    data,
    canEdit,
    onCellUpdate
  });
  
  return (
    <Card className="shadow-sm overflow-hidden w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Leads & Candidates</CardTitle>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
        <LeadsSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-auto max-h-[calc(100vh-250px)]">
          {viewMode === 'tile' ? (
            <TileView 
              data={filteredData}
              approvedLeads={approvedLeads}
              onApprove={handleApprove}
              onLeadClick={handleRowClick}
            />
          ) : (
            <ListView 
              data={filteredData}
              columns={columns}
              approvedLeads={approvedLeads}
              editingCell={editingCell}
              canEdit={canEdit}
              onApprove={handleApprove}
              onLeadClick={handleRowClick}
              onStartEditing={startEditing}
              onSaveEdit={saveEdit}
              onCancelEditing={cancelEditing}
            />
          )}
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
