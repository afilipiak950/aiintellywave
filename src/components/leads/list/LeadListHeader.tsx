
import { SortDirection, SortField } from "../../../types/leadTable";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface LeadListHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
}

const LeadListHeader = ({ sortField, sortDirection, handleSort }: LeadListHeaderProps) => {
  // Render sort indicator for column headers
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="inline h-4 w-4 ml-1" />
      : <ChevronDown className="inline h-4 w-4 ml-1" />;
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead 
          className="font-medium cursor-pointer"
          onClick={() => handleSort('name')}
        >
          Name {renderSortIndicator('name')}
        </TableHead>
        <TableHead 
          className="font-medium cursor-pointer"
          onClick={() => handleSort('company')}
        >
          Company {renderSortIndicator('company')}
        </TableHead>
        <TableHead 
          className="font-medium cursor-pointer"
          onClick={() => handleSort('position')}
        >
          Position {renderSortIndicator('position')}
        </TableHead>
        <TableHead 
          className="font-medium cursor-pointer"
          onClick={() => handleSort('status')}
        >
          Status {renderSortIndicator('status')}
        </TableHead>
        <TableHead 
          className="font-medium cursor-pointer"
          onClick={() => handleSort('created_at')}
        >
          Created {renderSortIndicator('created_at')}
        </TableHead>
        <TableHead 
          className="font-medium cursor-pointer"
          onClick={() => handleSort('project_name')}
        >
          Project {renderSortIndicator('project_name')}
        </TableHead>
        <TableHead className="font-medium text-right">LinkedIn</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default LeadListHeader;
