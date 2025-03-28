
import { useState } from 'react';
import { ExcelRow } from '../types/project';

interface UseLeadsTableOptions {
  data: ExcelRow[];
  canEdit: boolean;
  onCellUpdate: (rowId: string, column: string, value: string) => Promise<void>;
}

export const useLeadsTable = ({ data, canEdit, onCellUpdate }: UseLeadsTableOptions) => {
  const [editingCell, setEditingCell] = useState<{rowId: string, column: string} | null>(null);
  const [selectedLead, setSelectedLead] = useState<ExcelRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('tile');
  const [approvedLeads, setApprovedLeads] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const handleApprove = (id: string) => {
    setApprovedLeads(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  return {
    filteredData,
    editingCell,
    selectedLead,
    isDetailOpen,
    viewMode,
    approvedLeads,
    searchTerm,
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
