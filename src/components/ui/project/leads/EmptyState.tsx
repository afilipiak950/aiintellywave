
import { TableCell, TableRow } from "../../table";

interface EmptyStateProps {
  columnsCount: number;
}

const EmptyState = ({ columnsCount }: EmptyStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={columnsCount + 3} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center space-y-2 py-6">
          <p className="text-gray-500 text-lg">No leads found matching your search criteria.</p>
          <p className="text-gray-400 text-sm">Try adjusting your search parameters.</p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmptyState;
