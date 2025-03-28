
import { Button } from "../../button";
import { Grid, List } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'tile' | 'list';
  setViewMode: (mode: 'tile' | 'list') => void;
}

const ViewToggle = ({ viewMode, setViewMode }: ViewToggleProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={viewMode === 'tile' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('tile')}
        className="flex gap-1"
      >
        <Grid size={16} />
        <span className="hidden sm:inline">Tiles</span>
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('list')}
        className="flex gap-1"
      >
        <List size={16} />
        <span className="hidden sm:inline">List</span>
      </Button>
    </div>
  );
};

export default ViewToggle;
