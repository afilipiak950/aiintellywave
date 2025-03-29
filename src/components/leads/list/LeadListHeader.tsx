
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SortDirection, SortField } from "../../../types/leadTable";

interface LeadListHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
}

const LeadListHeader = ({
  sortField,
  sortDirection,
  handleSort,
}: LeadListHeaderProps) => {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead 
          className="w-[200px] cursor-pointer"
          onClick={() => handleSort('name')}
        >
          <div className="flex items-center">
            Name {renderSortIcon('name')}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => handleSort('company')}
        >
          <div className="flex items-center">
            Company {renderSortIcon('company')}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => handleSort('position')}
        >
          <div className="flex items-center">
            Position {renderSortIcon('position')}
          </div>
        </TableHead>
        <TableHead 
          className="w-[120px] cursor-pointer"
          onClick={() => handleSort('status')}
        >
          <div className="flex items-center">
            Status {renderSortIcon('status')}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer w-[180px]"
          onClick={() => handleSort('project_name')}
        >
          <div className="flex items-center">
            Project {renderSortIcon('project_name')}
          </div>
        </TableHead>
        <TableHead className="text-right w-[100px]">LinkedIn</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default LeadListHeader;
