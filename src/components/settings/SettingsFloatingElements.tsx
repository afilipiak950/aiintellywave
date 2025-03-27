
import React from 'react';

export const SettingsFloatingElements: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Top area elements */}
      <div className="absolute top-[10%] left-[20%] animate-float">
        <div className="w-10 h-10 rounded-full bg-[#FEC6A1] opacity-60"></div>
      </div>
      
      <div className="absolute top-[15%] right-[25%] animate-float-delay">
        <div className="w-8 h-8 rounded-full bg-[#D3E4FD] opacity-70"></div>
      </div>
      
      <div className="absolute top-[30%] left-[40%] animate-float-slow">
        <div className="w-12 h-12 rounded-full bg-[#E5DEFF] opacity-50"></div>
      </div>
      
      {/* Middle area elements */}
      <div className="absolute top-[45%] right-[15%] animate-float">
        <div className="w-16 h-16 rounded-full bg-[#FFDEE2] opacity-40"></div>
      </div>
      
      <div className="absolute top-[50%] left-[10%] animate-float-delay">
        <div className="w-14 h-14 rounded-full bg-[#F2FCE2] opacity-50"></div>
      </div>
      
      <div className="absolute top-[60%] left-[30%] animate-float-slow">
        <div className="w-7 h-7 rounded-full bg-[#FEF7CD] opacity-60"></div>
      </div>
      
      {/* Bottom area elements */}
      <div className="absolute bottom-[10%] right-[30%] animate-float">
        <div className="w-9 h-9 rounded-full bg-[#FDE1D3] opacity-50"></div>
      </div>
      
      <div className="absolute bottom-[25%] left-[20%] animate-float-delay">
        <div className="w-11 h-11 rounded-full bg-[#F1F0FB] opacity-40"></div>
      </div>
      
      <div className="absolute bottom-[15%] right-[15%] animate-float-slow">
        <div className="w-6 h-6 rounded-full bg-[#D3E4FD] opacity-70"></div>
      </div>
    </div>
  );
};
