
import React from 'react';

export const FloatingElements: React.FC = () => {
  return (
    <div className="relative w-full h-full">
      {/* Purple dot top left */}
      <div className="absolute top-[10%] left-[5%] animate-float-delay">
        <div className="w-4 h-4 rounded-full bg-purple-400"></div>
      </div>
      
      {/* Pink dot top right */}
      <div className="absolute top-[15%] right-[8%] animate-float">
        <div className="w-3 h-3 rounded-full bg-pink-300"></div>
      </div>
      
      {/* Blue dot middle left */}
      <div className="absolute top-[30%] left-[3%] animate-float-slow">
        <div className="w-5 h-5 rounded-full bg-blue-300"></div>
      </div>
      
      {/* Orange dot top center */}
      <div className="absolute top-[20%] left-[35%] animate-float">
        <div className="w-4 h-4 rounded-full bg-orange-300"></div>
      </div>
      
      {/* Cyan dot middle right */}
      <div className="absolute top-[40%] right-[5%] animate-float-slow">
        <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
      </div>
      
      {/* Purple dot bottom right */}
      <div className="absolute bottom-[15%] right-[10%] animate-float-delay">
        <div className="w-6 h-6 rounded-full bg-purple-400"></div>
      </div>
      
      {/* Yellow dot middle bottom */}
      <div className="absolute bottom-[30%] left-[20%] animate-float">
        <div className="w-4 h-4 rounded-full bg-amber-300"></div>
      </div>
      
      {/* Orange dot bottom left */}
      <div className="absolute bottom-[10%] left-[8%] animate-float-slow">
        <div className="w-3 h-3 rounded-full bg-orange-400"></div>
      </div>
      
      {/* Pink dot center right */}
      <div className="absolute top-[55%] right-[25%] animate-float-delay">
        <div className="w-3 h-3 rounded-full bg-pink-400"></div>
      </div>
      
      {/* Blue dot bottom center */}
      <div className="absolute bottom-[5%] left-[45%] animate-float">
        <div className="w-5 h-5 rounded-full bg-blue-300"></div>
      </div>
    </div>
  );
};
