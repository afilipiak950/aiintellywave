
import { useState, useMemo, useEffect } from 'react';
import { ExcelRow } from '../types/project';
import { updateApprovalStatus, fetchLeadsWithApprovalStatus } from '../services/excel/excel-data-core';
import { toast } from './use-toast';

interface UseLeadsTableOptions {
  data: ExcelRow[];
  columns?: string[];
  canEdit: boolean;
  onCellUpdate: (rowId: string, column: string, value: string) => Promise<void>;
  projectId: string;
}

export const useLeadsTable = ({ data, canEdit, onCellUpdate, columns = [], projectId }: UseLeadsTableOptions) => {
  const [editingCell, setEditingCell] = useState<{rowId: string, column: string} | null>(null);
  const [selectedLead, setSelectedLead] = useState<ExcelRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('tile');
  const [approvedLeads, setApprovedLeads] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdatingApproval, setIsUpdatingApproval] = useState(false);
  
  // Fetch approval statuses on initial load
  useEffect(() => {
    const loadApprovalStatuses = async () => {
      try {
        const statusData = await fetchLeadsWithApprovalStatus(projectId);
        const approvedIds = new Set<string>();
        
        statusData.forEach(item => {
          if (item.approval_status === 'approved') {
            approvedIds.add(item.id);
          }
        });
        
        setApprovedLeads(approvedIds);
      } catch (error) {
        console.error('Error loading approval statuses:', error);
      }
    };
    
    if (projectId) {
      loadApprovalStatuses();
    }
  }, [projectId]);
  
  const visibleColumns = useMemo(() => {
    const priorityColumns = ['Name', 'Company', 'Email', 'Title', 'City'];
    
    if (columns.length <= 5) {
      return columns;
    }
    
    const existingPriority = priorityColumns.filter(col => columns.includes(col));
    
    if (existingPriority.length >= 3) {
      return existingPriority;
    }
    
    return columns.slice(0, 4);
  }, [columns]);
  
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

  const handleApprove = async (id: string) => {
    if (isUpdatingApproval) return;

    setIsUpdatingApproval(true);
    try {
      const isCurrentlyApproved = approvedLeads.has(id);
      
      // Update database with new approval status
      await updateApprovalStatus(id, isCurrentlyApproved ? null : 'approved');
      
      // Update local state
      setApprovedLeads(prev => {
        const updated = new Set(prev);
        if (updated.has(id)) {
          updated.delete(id);
        } else {
          updated.add(id);
        }
        return updated;
      });
      
      toast({
        title: isCurrentlyApproved ? "Approval Removed" : "Lead Approved",
        description: isCurrentlyApproved 
          ? "The lead approval has been removed." 
          : "The lead has been marked as approved.",
      });
    } catch (error) {
      console.error('Error updating approval status:', error);
      toast({
        title: "Error",
        description: "Failed to update approval status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingApproval(false);
    }
  };

  return {
    filteredData,
    editingCell,
    selectedLead,
    isDetailOpen,
    viewMode,
    approvedLeads,
    searchTerm,
    visibleColumns,
    isUpdatingApproval,
    setSearchTerm,
    startEditing,
    cancelEditing,
    saveEdit,
    handleRowClick,
    handleApprove,
    setViewMode,
    setIsDetailOpen
  };
};
