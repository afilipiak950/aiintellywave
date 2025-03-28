import { useState, useCallback } from 'react';
import { ExcelRow } from '../types/project';
import { toast } from './use-toast';

interface EditingCell {
  rowId: string | null;
  column: string | null;
  value: string | null;
}

interface UseLeadsTableProps {
  data: ExcelRow[];
  canEdit: boolean;
  onCellUpdate: (rowId: string, column: string, value: string) => Promise<void>;
  columns: string[];
}

export const useLeadsTable = ({
  data,
  canEdit,
  onCellUpdate,
  columns
}: UseLeadsTableProps) => {
  const [editingCell, setEditingCell] = useState<EditingCell>({
    rowId: null,
    column: null,
    value: null
  });
  const [selectedLead, setSelectedLead] = useState<ExcelRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'tile'>('list');
  const [approvedLeads, setApprovedLeads] = useState<Set<string>>(new Set());

  // Filter data based on current filters
  const filteredData = data;

  // Define important columns to always show in list view
  const priorityColumns = ['name', 'email', 'phone', 'company', 'position'];
  
  // Get columns to display in list view based on priority + a few more
  const visibleColumns = columns.filter(col => {
    // Always include priority columns
    if (priorityColumns.includes(col.toLowerCase())) return true;
    
    // Hide these columns by default
    if (['id', 'notes', 'description', 'details', 'requirements'].includes(col.toLowerCase())) return false;
    
    // For remaining columns, only show a few (keep the table clean)
    // Make sure we have at least 5 but no more than 7 columns in total
    return priorityColumns.length < 5;
  }).slice(0, 7); // Limit to 7 columns max

  const startEditing = useCallback((rowId: string, column: string, currentValue: string) => {
    if (!canEdit) return;
    setEditingCell({
      rowId,
      column,
      value: currentValue
    });
  }, [canEdit]);

  const cancelEditing = useCallback(() => {
    setEditingCell({
      rowId: null,
      column: null,
      value: null
    });
  }, []);

  const saveEdit = useCallback(async (newValue: string) => {
    if (!editingCell.rowId || !editingCell.column) return;
    
    try {
      await onCellUpdate(editingCell.rowId, editingCell.column, newValue);
      toast({
        title: "Updated",
        description: "Cell has been updated successfully."
      });
    } catch (error) {
      console.error("Error updating cell:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the cell.",
        variant: "destructive"
      });
    } finally {
      cancelEditing();
    }
  }, [editingCell, onCellUpdate, cancelEditing]);

  const handleRowClick = useCallback((lead: ExcelRow) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  }, []);

  const handleApprove = useCallback((rowId: string) => {
    setApprovedLeads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
    
    toast({
      title: "Success",
      description: "Lead status updated.",
    });
  }, []);

  return {
    filteredData,
    editingCell,
    selectedLead,
    isDetailOpen,
    viewMode,
    approvedLeads,
    visibleColumns,
    startEditing,
    cancelEditing,
    saveEdit,
    handleRowClick,
    handleApprove,
    setViewMode,
    setIsDetailOpen
  };
};
