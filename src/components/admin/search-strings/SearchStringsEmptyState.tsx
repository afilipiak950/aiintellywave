
import React from 'react';

interface SearchStringsEmptyStateProps {
  searchTerm: string;
}

const SearchStringsEmptyState: React.FC<SearchStringsEmptyStateProps> = ({ searchTerm }) => {
  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-medium">No search strings found</h3>
      <p className="text-muted-foreground mt-2">
        {searchTerm 
          ? `No search strings match your search: "${searchTerm}"` 
          : "No search strings have been created yet by any customers"}
      </p>
    </div>
  );
};

export default SearchStringsEmptyState;
