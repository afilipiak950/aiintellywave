
import { Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadViewToggleProps {
  viewMode: 'list' | 'tile';
  setViewMode: (mode: 'list' | 'tile') => void;
}

const LeadViewToggle = ({ viewMode, setViewMode }: LeadViewToggleProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={viewMode === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('list')}
        className="flex gap-1 items-center"
      >
        <List size={16} />
        <span className="hidden sm:inline">Liste</span>
      </Button>
      <Button
        variant={viewMode === 'tile' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('tile')}
        className="flex gap-1 items-center"
      >
        <Grid size={16} />
        <span className="hidden sm:inline">Karten</span>
      </Button>
    </div>
  );
};

export default LeadViewToggle;
