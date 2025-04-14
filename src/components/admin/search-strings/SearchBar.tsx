
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  onRefresh, 
  isRefreshing 
}) => {
  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, email, type or content..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-1"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
