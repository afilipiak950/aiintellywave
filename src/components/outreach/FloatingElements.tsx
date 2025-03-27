
import React from 'react';
import { Sparkles, Zap, Star, Heart, Bookmark, Bell, Award, CheckCircle } from 'lucide-react';

export const FloatingElements: React.FC = () => {
  return (
    <>
      {/* Top left area */}
      <div className="absolute top-[10%] left-[10%] animate-float-delay">
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 backdrop-blur-md flex items-center justify-center">
          <Star className="w-4 h-4 text-indigo-400" />
        </div>
      </div>
      
      {/* Top right area */}
      <div className="absolute top-[15%] right-[12%] animate-float">
        <div className="w-7 h-7 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
      </div>
      
      {/* Middle left */}
      <div className="absolute top-[40%] left-[8%] animate-float-slow">
        <div className="w-9 h-9 rounded-full bg-purple-500/10 backdrop-blur-md flex items-center justify-center">
          <Zap className="w-5 h-5 text-purple-400" />
        </div>
      </div>
      
      {/* Middle right */}
      <div className="absolute top-[35%] right-[7%] animate-float">
        <div className="w-8 h-8 rounded-full bg-blue-500/15 backdrop-blur-md flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-blue-400" />
        </div>
      </div>
      
      {/* Bottom left */}
      <div className="absolute bottom-[20%] left-[14%] animate-float-delay">
        <div className="w-9 h-9 rounded-full bg-amber-500/15 backdrop-blur-md flex items-center justify-center">
          <Award className="w-4 h-4 text-amber-400" />
        </div>
      </div>
      
      {/* Bottom right */}
      <div className="absolute bottom-[25%] right-[15%] animate-float">
        <div className="w-7 h-7 rounded-full bg-rose-500/15 backdrop-blur-md flex items-center justify-center">
          <Heart className="w-3.5 h-3.5 text-rose-400" />
        </div>
      </div>
      
      {/* Extra small elements for visual interest - more distributed */}
      <div className="absolute top-[70%] left-[25%] animate-float-slow">
        <div className="w-5 h-5 rounded-full bg-emerald-500/10 backdrop-blur-md"></div>
      </div>
      
      <div className="absolute bottom-[15%] right-[35%] animate-float">
        <div className="w-6 h-6 rounded-full bg-cyan-500/10 backdrop-blur-md"></div>
      </div>
      
      <div className="absolute top-[25%] left-[30%] animate-float-delay">
        <div className="w-4 h-4 rounded-full bg-violet-500/10 backdrop-blur-md"></div>
      </div>
      
      <div className="absolute top-[60%] right-[28%] animate-float-slow">
        <div className="w-5 h-5 rounded-full bg-orange-500/10 backdrop-blur-md"></div>
      </div>
    </>
  );
};
