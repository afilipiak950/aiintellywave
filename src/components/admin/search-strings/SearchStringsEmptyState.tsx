
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
      <p className="text-sm text-muted-foreground mt-4">
        If you believe search strings should be visible here, please check:
        <ul className="list-disc list-inside mt-2">
          <li>The customer has permission to create search strings</li>
          <li>The search_strings table in Supabase contains records</li>
          <li>There are no RLS policies blocking admin access</li>
        </ul>
      </p>
    </div>
  );
};

export default SearchStringsEmptyState;
