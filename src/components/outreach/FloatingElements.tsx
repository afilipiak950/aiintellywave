
import React from 'react';
import { Sparkles, Zap, Star, Heart, Bookmark, Bell } from 'lucide-react';

export const FloatingElements: React.FC = () => {
  return (
    <>
      {/* Top row */}
      <div className="absolute top-20 right-10 animate-float">
        <div className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
      </div>
      
      <div className="absolute top-40 left-20 animate-float-delay">
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 backdrop-blur-md flex items-center justify-center">
          <Star className="w-4 h-4 text-indigo-400" />
        </div>
      </div>
      
      {/* Middle left */}
      <div className="absolute top-1/4 left-[15%] animate-float-slow">
        <div className="w-12 h-12 rounded-full bg-purple-500/10 backdrop-blur-md flex items-center justify-center">
          <Zap className="w-6 h-6 text-purple-400" />
        </div>
      </div>
      
      {/* Middle right */}
      <div className="absolute top-1/3 right-[15%] animate-float">
        <div className="w-10 h-10 rounded-full bg-blue-500/15 backdrop-blur-md flex items-center justify-center">
          <Bell className="w-5 h-5 text-blue-400" />
        </div>
      </div>
      
      {/* Bottom row */}
      <div className="absolute bottom-1/4 right-1/3 animate-float">
        <div className="w-9 h-9 rounded-full bg-rose-500/15 backdrop-blur-md flex items-center justify-center">
          <Heart className="w-4 h-4 text-rose-400" />
        </div>
      </div>
      
      <div className="absolute bottom-40 left-[25%] animate-float-delay">
        <div className="w-11 h-11 rounded-full bg-amber-500/15 backdrop-blur-md flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-amber-400" />
        </div>
      </div>
      
      {/* Extra small elements for visual interest */}
      <div className="absolute top-[60%] left-10 animate-float-slow">
        <div className="w-6 h-6 rounded-full bg-emerald-500/10 backdrop-blur-md"></div>
      </div>
      
      <div className="absolute bottom-20 right-[20%] animate-float">
        <div className="w-7 h-7 rounded-full bg-cyan-500/10 backdrop-blur-md"></div>
      </div>
    </>
  );
};
