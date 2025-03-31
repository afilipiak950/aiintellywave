
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  searchPlaceholder: string;
}

const PageHeader = ({ 
  searchTerm, 
  onSearchChange, 
  onRefresh, 
  searchPlaceholder 
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-2xl font-bold">Companies & Customers</h1>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
