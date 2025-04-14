
import React from 'react';

const SearchStringsLoading: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border rounded-md animate-pulse">
          <div className="w-1/3 h-4 bg-gray-200 rounded mb-4"></div>
          <div className="w-full h-8 bg-gray-200 rounded mb-2"></div>
          <div className="flex gap-2 mt-4">
            <div className="w-20 h-6 bg-gray-200 rounded"></div>
            <div className="w-20 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchStringsLoading;
