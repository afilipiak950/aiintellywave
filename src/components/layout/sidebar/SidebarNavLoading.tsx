
import React from 'react';

export const SidebarNavLoading = () => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <div 
          key={`nav-loading-${index}`} 
          className="h-10 bg-sidebar-hover/20 animate-pulse rounded-md mb-1"
        />
      ))}
    </>
  );
};
