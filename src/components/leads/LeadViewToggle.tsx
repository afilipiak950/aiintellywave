
import { Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadViewToggleProps {
  viewMode: 'list' | 'card';
  setViewMode: (mode: 'list' | 'card') => void;
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
        <span className="hidden sm:inline">List</span>
      </Button>
      <Button
        variant={viewMode === 'card' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('card')}
        className="flex gap-1 items-center"
      >
        <Grid size={16} />
        <span className="hidden sm:inline">Cards</span>
      </Button>
    </div>
  );
};

export default LeadViewToggle;
