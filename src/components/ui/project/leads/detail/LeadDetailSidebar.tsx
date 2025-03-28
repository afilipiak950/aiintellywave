
import { useState } from "react";

interface LeadDetailSidebarProps {
  columns: string[];
  onColumnSelect?: (column: string) => void;
  selectedColumn?: string;
}

const LeadDetailSidebar = ({ 
  columns,
  onColumnSelect,
  selectedColumn
}: LeadDetailSidebarProps) => {
  return (
    <div className="p-4 space-y-2 font-medium">
      {columns.map((column) => (
        <div 
          key={column} 
          className={`cursor-pointer p-2 rounded hover:bg-muted ${selectedColumn === column ? 'bg-muted' : ''}`}
          onClick={() => onColumnSelect?.(column)}
        >
          {column}
        </div>
      ))}
    </div>
  );
};

export default LeadDetailSidebar;
