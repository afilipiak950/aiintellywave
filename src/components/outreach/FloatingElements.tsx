
import React from 'react';

export const FloatingElements: React.FC = () => {
  return (
    <div className="relative w-full h-full">
      {/* Purple dot top left */}
      <div className="absolute top-[10%] left-[5%] animate-float-delay">
        <div className="w-5 h-5 rounded-full bg-purple-400 blur-[1px]"></div>
      </div>
      
      {/* Pink dot top right */}
      <div className="absolute top-[15%] right-[8%] animate-float">
        <div className="w-6 h-6 rounded-full bg-pink-400 blur-[1px]"></div>
      </div>
      
      {/* Blue dot middle left */}
      <div className="absolute top-[30%] left-[3%] animate-float-slow">
        <div className="w-8 h-8 rounded-full bg-blue-400 blur-[1px]"></div>
      </div>
      
      {/* Orange dot top center */}
      <div className="absolute top-[20%] left-[35%] animate-float">
        <div className="w-7 h-7 rounded-full bg-orange-400 blur-[1px]"></div>
      </div>
      
      {/* Cyan dot middle right */}
      <div className="absolute top-[40%] right-[5%] animate-float-slow">
        <div className="w-9 h-9 rounded-full bg-cyan-400 blur-[1px]"></div>
      </div>
      
      {/* Purple dot bottom right */}
      <div className="absolute bottom-[15%] right-[10%] animate-float-delay">
        <div className="w-12 h-12 rounded-full bg-purple-500 opacity-70 blur-[2px]"></div>
      </div>
      
      {/* Yellow dot middle bottom */}
      <div className="absolute bottom-[30%] left-[20%] animate-float">
        <div className="w-10 h-10 rounded-full bg-amber-400 opacity-80 blur-[1px]"></div>
      </div>
      
      {/* Orange dot bottom left */}
      <div className="absolute bottom-[10%] left-[8%] animate-float-slow">
        <div className="w-8 h-8 rounded-full bg-orange-500 opacity-70 blur-[1px]"></div>
      </div>
      
      {/* Pink dot center right */}
      <div className="absolute top-[55%] right-[25%] animate-float-delay">
        <div className="w-7 h-7 rounded-full bg-pink-500 opacity-80 blur-[1px]"></div>
      </div>
      
      {/* Blue dot bottom center */}
      <div className="absolute bottom-[5%] left-[45%] animate-float">
        <div className="w-11 h-11 rounded-full bg-blue-500 opacity-70 blur-[2px]"></div>
      </div>
      
      {/* Additional bright dots */}
      <div className="absolute top-[70%] right-[15%] animate-float-slow">
        <div className="w-6 h-6 rounded-full bg-indigo-400 opacity-90 blur-[1px]"></div>
      </div>
      
      <div className="absolute top-[25%] left-[60%] animate-float-delay">
        <div className="w-9 h-9 rounded-full bg-green-400 opacity-80 blur-[1px]"></div>
      </div>
      
      <div className="absolute bottom-[40%] right-[3%] animate-float">
        <div className="w-8 h-8 rounded-full bg-violet-400 opacity-90 blur-[1px]"></div>
      </div>
      
      <div className="absolute top-[5%] left-[25%] animate-float-slow">
        <div className="w-7 h-7 rounded-full bg-rose-400 opacity-80 blur-[1px]"></div>
      </div>
      
      <div className="absolute bottom-[20%] left-[30%] animate-float-delay">
        <div className="w-10 h-10 rounded-full bg-teal-400 opacity-70 blur-[2px]"></div>
      </div>
    </div>
  );
};
