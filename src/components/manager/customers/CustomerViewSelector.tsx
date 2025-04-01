
import { Button } from '@/components/ui/button';

interface CustomerViewSelectorProps {
  view: 'grid' | 'table';
  setView: (view: 'grid' | 'table') => void;
}

const CustomerViewSelector = ({ view, setView }: CustomerViewSelectorProps) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant={view === 'grid' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => setView('grid')}
      >
        Grid
      </Button>
      <Button 
        variant={view === 'table' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => setView('table')}
      >
        Table
      </Button>
    </div>
  );
};

export default CustomerViewSelector;
