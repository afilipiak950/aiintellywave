
import React from 'react';

export const SidebarNavLoading = () => {
  return (
    <div className="space-y-2">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="flex items-center px-3 py-2">
          <div className="h-5 w-5 rounded-md bg-gray-200 animate-pulse mr-2"></div>
          <div className="h-4 w-32 rounded-md bg-gray-200 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
};
