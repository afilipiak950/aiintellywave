
import React from 'react';

export const SidebarNavLoading = () => {
  // Create 6 placeholder items for loading state
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <div key={`loading-${i}`} className="flex items-center px-3 py-2 animate-pulse">
          <div className="w-8 h-8 bg-indigo-900/50 rounded-md"></div>
          <div className="ml-3 h-4 bg-indigo-900/30 rounded w-24"></div>
        </div>
      ))}
    </>
  );
};
