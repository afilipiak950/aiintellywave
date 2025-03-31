
import { Button } from "@/components/ui/button";

interface ViewToggleProps {
  view: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
}

const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={view === 'table' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="h-8"
      >
        Table
      </Button>
      <Button
        variant={view === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="h-8"
      >
        Grid
      </Button>
    </div>
  );
};

export default ViewToggle;
