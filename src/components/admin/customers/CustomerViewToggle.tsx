
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface CustomerViewToggleProps {
  view: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
  onRefresh: () => void;
  loading: boolean;
}

const CustomerViewToggle = ({ view, onViewChange, onRefresh, loading }: CustomerViewToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant={view === 'grid' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onViewChange('grid')}
      >
        Grid
      </Button>
      <Button 
        variant={view === 'table' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onViewChange('table')}
      >
        Table
      </Button>
      
      <Button 
        onClick={onRefresh} 
        variant="outline"
        disabled={loading}
        className="flex items-center gap-2 ml-2"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
};

export default CustomerViewToggle;
