
import React from 'react';

const SearchStringsEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-medium mb-2">No search strings found</h3>
      <p className="text-gray-500 mb-4">
        You haven't created any search strings yet. Use the form above to create your first search string.
      </p>
    </div>
  );
};

export default SearchStringsEmptyState;
