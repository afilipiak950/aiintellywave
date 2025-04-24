
import React from 'react';

export const FloatingElements: React.FC = () => {
  return (
    <div className="relative w-full h-full">
      {/* Purple dot top left */}
      <div className="absolute top-[10%] left-[5%] opacity-60" style={{ animation: 'float 25s ease-in-out infinite' }}>
        <div className="w-4 h-4 rounded-full bg-purple-400"></div>
      </div>
      
      {/* Pink dot top right */}
      <div className="absolute top-[15%] right-[8%] opacity-70" style={{ animation: 'float 30s ease-in-out infinite 2s' }}>
        <div className="w-3 h-3 rounded-full bg-pink-300"></div>
      </div>
      
      {/* Blue dot middle left */}
      <div className="absolute top-[30%] left-[3%] opacity-60" style={{ animation: 'float 35s ease-in-out infinite 5s' }}>
        <div className="w-5 h-5 rounded-full bg-blue-300"></div>
      </div>
      
      {/* Orange dot top center */}
      <div className="absolute top-[20%] left-[35%] opacity-70" style={{ animation: 'float 28s ease-in-out infinite 3s' }}>
        <div className="w-4 h-4 rounded-full bg-orange-300"></div>
      </div>
      
      {/* Cyan dot middle right */}
      <div className="absolute top-[40%] right-[5%] opacity-60" style={{ animation: 'float 32s ease-in-out infinite 7s' }}>
        <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
      </div>
      
      {/* Purple dot bottom right */}
      <div className="absolute bottom-[15%] right-[10%] opacity-70" style={{ animation: 'float 27s ease-in-out infinite 4s' }}>
        <div className="w-6 h-6 rounded-full bg-purple-400"></div>
      </div>
      
      {/* Yellow dot middle bottom */}
      <div className="absolute bottom-[30%] left-[20%] opacity-60" style={{ animation: 'float 33s ease-in-out infinite 6s' }}>
        <div className="w-4 h-4 rounded-full bg-amber-300"></div>
      </div>
      
      {/* Orange dot bottom left */}
      <div className="absolute bottom-[10%] left-[8%] opacity-70" style={{ animation: 'float 40s ease-in-out infinite 8s' }}>
        <div className="w-3 h-3 rounded-full bg-orange-400"></div>
      </div>
      
      {/* Pink dot center right */}
      <div className="absolute top-[55%] right-[25%] opacity-60" style={{ animation: 'float 36s ease-in-out infinite 9s' }}>
        <div className="w-3 h-3 rounded-full bg-pink-400"></div>
      </div>
      
      {/* Blue dot bottom center */}
      <div className="absolute bottom-[5%] left-[45%] opacity-70" style={{ animation: 'float 29s ease-in-out infinite 1s' }}>
        <div className="w-5 h-5 rounded-full bg-blue-300"></div>
      </div>
    </div>
  );
};
