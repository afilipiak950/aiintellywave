
import React from 'react';
import { FileSearch, RefreshCw, X } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center py-12 border rounded-md border-dashed">
      <div className="bg-muted h-12 w-12 rounded-full flex items-center justify-center mb-4">
        <FileSearch className="h-6 w-6 text-muted-foreground" />
      </div>
      
      {searchTerm ? (
        <>
          <h3 className="text-lg font-medium mb-2">No matching search strings</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            No search strings were found matching "{searchTerm}".
          </p>
          <Button variant="outline" onClick={onReset}>
            <X className="mr-2 h-4 w-4" />
            Clear search
          </Button>
        </>
      ) : hasStrings ? (
        <>
          <h3 className="text-lg font-medium mb-2">Filtering Error</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            There are search strings in the database, but they're being filtered out.
            Try refreshing the data.
          </p>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium mb-2">No search strings yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            No search strings have been created by customers yet.
            They will appear here once customers start generating search strings.
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchStringsEmptyState;
