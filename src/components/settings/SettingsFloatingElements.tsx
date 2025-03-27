
import React from 'react';

export const SettingsFloatingElements: React.FC = () => {
  return (
    <div className="relative w-full h-full">
      {/* Peach circle top */}
      <div className="absolute top-[15%] left-[50%] transform -translate-x-1/2 animate-float-delay">
        <div className="w-6 h-6 rounded-full bg-[#FEC6A1] opacity-70"></div>
      </div>
      
      {/* Light blue circle middle */}
      <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 animate-float-slow">
        <div className="w-5 h-5 rounded-full bg-[#D3E4FD] opacity-70"></div>
      </div>
      
      {/* Pink circle bottom left */}
      <div className="absolute bottom-[20%] left-[20%] animate-float">
        <div className="w-8 h-8 rounded-full bg-[#FFDEE2] opacity-60"></div>
      </div>

      {/* Additional subtle elements */}
      <div className="absolute top-[30%] right-[20%] animate-float-slow">
        <div className="w-4 h-4 rounded-full bg-[#E5DEFF] opacity-50"></div>
      </div>
      
      <div className="absolute bottom-[40%] right-[30%] animate-float-delay">
        <div className="w-3 h-3 rounded-full bg-[#FDE1D3] opacity-40"></div>
      </div>
    </div>
  );
};
