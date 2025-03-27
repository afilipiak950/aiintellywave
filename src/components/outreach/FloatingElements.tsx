
import React from 'react';

export const FloatingElements: React.FC = () => {
  return (
    <>
      <div className="absolute top-20 right-10 animate-float">
        <div className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md"></div>
      </div>
      <div className="absolute bottom-40 left-20 animate-float-delay">
        <div className="w-16 h-16 rounded-full bg-indigo-500/20 backdrop-blur-md"></div>
      </div>
      <div className="absolute top-1/2 right-1/4 animate-float-slow">
        <div className="w-20 h-20 rounded-full bg-primary/10 backdrop-blur-md"></div>
      </div>
    </>
  );
};
