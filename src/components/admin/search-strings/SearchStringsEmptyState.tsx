
import React from 'react';
import { FileX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchStringsEmptyStateProps {
  searchTerm: string;
  hasStrings: boolean;
  onReset: () => void;
  onRefresh: () => void;
}

const SearchStringsEmptyState: React.FC<SearchStringsEmptyStateProps> = ({
  searchTerm,
  hasStrings,
  onReset,
  onRefresh
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <FileX className="h-12 w-12 text-muted-foreground mb-4" />
      
      <h3 className="text-xl font-semibold mb-2">
        {searchTerm
          ? "No matching search strings found"
          : "No search strings yet"}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {searchTerm 
          ? "No search strings match your current search criteria. Try adjusting your search or clearing the filters."
          : "No search strings have been created by customers yet. They will appear here once customers start generating search strings."}
      </p>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {searchTerm && (
          <Button variant="outline" onClick={onReset}>
            Clear Search
          </Button>
        )}
        
        <Button variant="outline" onClick={onRefresh} className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default SearchStringsEmptyState;
