
import { useState } from 'react';
import { useLeadsTable } from '../../../hooks/use-leads-table';
import { ExcelRow } from '../../../types/project';
import { Input } from '../input';
import { Button } from '../button';
import { Grid2X2, List, Search } from 'lucide-react';
import ListView from './leads/ListView';
import TileView from './leads/TileView';
import ResponsiveLeadDetail from './leads/ResponsiveLeadDetail';
import { motion, AnimatePresence } from 'framer-motion';

interface LeadsCandidatesTableProps {
  data: ExcelRow[];
  columns: string[];
  searchTerm: string;
  onSearchChange: (search: string) => void;
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
  const [viewMode, setViewMode] = useState<'list' | 'tile'>('list');
  
  const {
    filteredData,
    editingCell,
    selectedLead,
    isDetailOpen,
    approvedLeads,
    visibleColumns,
    isUpdatingApproval,
    startEditing,
    cancelEditing,
    saveEdit,
    handleRowClick,
    handleApprove,
    setIsDetailOpen
  } = useLeadsTable({
    data,
    columns,
    canEdit,
    onCellUpdate,
    projectId
  });
  
  // Define animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3, 
        when: "beforeChildren" 
      }
    }
  };
  
  const searchBarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4, 
        delay: 0.1 
      }
    }
  };
  
  const viewToggleVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3, 
        delay: 0.2 
      }
    }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 w-full"
    >
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <motion.div 
          variants={searchBarVariants}
          className="flex items-center relative flex-1"
        >
          <Search className="absolute left-3 text-gray-400" size={18} />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-full transition-all duration-300"
          />
        </motion.div>
        
        <motion.div 
          variants={viewToggleVariants} 
          className="flex space-x-2"
        >
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-indigo-600 hover:bg-indigo-700' : 'hover:bg-gray-50'}
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
          <Button
            variant={viewMode === 'tile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('tile')}
            className={viewMode === 'tile' ? 'bg-indigo-600 hover:bg-indigo-700' : 'hover:bg-gray-50'}
          >
            <Grid2X2 className="h-4 w-4 mr-1" />
            Grid
          </Button>
        </motion.div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'list' ? (
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
              isUpdatingApproval={isUpdatingApproval}
            />
          ) : (
            <TileView
              data={filteredData}
              approvedLeads={approvedLeads}
              onApprove={handleApprove}
              onLeadClick={handleRowClick}
              isUpdatingApproval={isUpdatingApproval}
            />
          )}
        </motion.div>
      </AnimatePresence>
      
      {selectedLead && (
        <ResponsiveLeadDetail
          lead={selectedLead}
          columns={columns}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          canEdit={canEdit}
        />
      )}
    </motion.div>
  );
};

export default LeadsCandidatesTable;
