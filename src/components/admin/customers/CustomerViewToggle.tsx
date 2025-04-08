
import { RefreshCw, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActionButton from "./buttons/ActionButton";

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
        className="flex items-center gap-1"
      >
        <LayoutGrid className="h-4 w-4" />
        Grid
      </Button>
      <Button 
        variant={view === 'table' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onViewChange('table')}
        className="flex items-center gap-1"
      >
        <List className="h-4 w-4" />
        Table
      </Button>
      
      <ActionButton
        onClick={onRefresh}
        icon={RefreshCw}
        label="Refresh"
        variant="outline"
        disabled={loading}
        className={loading ? "animate-spin" : ""}
      />
    </div>
  );
};

export default CustomerViewToggle;
