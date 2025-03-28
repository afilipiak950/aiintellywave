
import { ExcelRow } from "@/types/project";
import { cn } from "@/lib/utils";

interface LeadDetailSidebarProps {
  lead: ExcelRow;
  columns: string[];
  activeField: string | null;
  onFieldSelect: (fieldName: string) => void;
}

const LeadDetailSidebar = ({
  lead,
  columns,
  activeField,
  onFieldSelect
}: LeadDetailSidebarProps) => {
  // Remove id from the visible columns
  const visibleColumns = columns.filter(col => col !== 'id');

  return (
    <div className="w-1/4 min-w-[180px] bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto border-r">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">
        Select a field to view
      </h3>
      
      <div className="space-y-1">
        {visibleColumns.map(column => (
          <button
            key={column}
            onClick={() => onFieldSelect(column)}
            className={cn(
              "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
              activeField === column
                ? "bg-primary text-primary-foreground"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            {column.charAt(0).toUpperCase() + column.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeadDetailSidebar;
