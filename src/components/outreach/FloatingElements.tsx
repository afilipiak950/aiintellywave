
import React from 'react';
import { Sparkles, Zap, Star } from 'lucide-react';

export const FloatingElements: React.FC = () => {
  return (
    <>
      <div className="absolute top-20 right-10 animate-float">
        <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
      </div>
      
      <div className="absolute bottom-40 left-20 animate-float-delay">
        <div className="w-16 h-16 rounded-full bg-indigo-500/20 backdrop-blur-md flex items-center justify-center">
          <Star className="w-8 h-8 text-indigo-400" />
        </div>
      </div>
      
      <div className="absolute top-1/3 right-1/4 animate-float-slow">
        <div className="w-20 h-20 rounded-full bg-purple-500/10 backdrop-blur-md flex items-center justify-center">
          <Zap className="w-10 h-10 text-purple-400" />
        </div>
      </div>
      
      <div className="absolute bottom-1/4 right-1/3 animate-float">
        <div className="w-14 h-14 rounded-full bg-blue-500/15 backdrop-blur-md"></div>
      </div>
      
      <div className="absolute top-2/3 left-1/3 animate-float-delay">
        <div className="w-10 h-10 rounded-full bg-rose-500/15 backdrop-blur-md"></div>
      </div>
    </>
  );
};
