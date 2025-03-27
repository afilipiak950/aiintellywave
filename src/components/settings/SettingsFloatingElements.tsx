
import React from 'react';

export const SettingsFloatingElements: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Small dots (top section) */}
      <div className="absolute top-[5%] left-[8%] animate-float-slow">
        <div className="w-4 h-4 rounded-full bg-[#FEC6A1] opacity-60"></div>
      </div>
      <div className="absolute top-[8%] right-[12%] animate-float">
        <div className="w-3 h-3 rounded-full bg-[#D3E4FD] opacity-70"></div>
      </div>
      <div className="absolute top-[12%] left-[25%] animate-float-delay">
        <div className="w-5 h-5 rounded-full bg-[#E5DEFF] opacity-50"></div>
      </div>
      <div className="absolute top-[7%] right-[30%] animate-float-slow">
        <div className="w-6 h-6 rounded-full bg-[#FFDEE2] opacity-40"></div>
      </div>
      <div className="absolute top-[15%] left-[18%] animate-float">
        <div className="w-8 h-8 rounded-full bg-[#F2FCE2] opacity-30"></div>
      </div>
      <div className="absolute top-[10%] right-[40%] animate-float-delay">
        <div className="w-4 h-4 rounded-full bg-[#FEF7CD] opacity-50"></div>
      </div>
      
      {/* Medium dots (middle-top section) */}
      <div className="absolute top-[20%] left-[35%] animate-float">
        <div className="w-10 h-10 rounded-full bg-[#FEC6A1] opacity-40"></div>
      </div>
      <div className="absolute top-[25%] right-[15%] animate-float-slow">
        <div className="w-7 h-7 rounded-full bg-[#D3E4FD] opacity-60"></div>
      </div>
      <div className="absolute top-[30%] left-[12%] animate-float-delay">
        <div className="w-9 h-9 rounded-full bg-[#E5DEFF] opacity-35"></div>
      </div>
      <div className="absolute top-[28%] right-[28%] animate-float">
        <div className="w-5 h-5 rounded-full bg-[#FFDEE2] opacity-50"></div>
      </div>
      <div className="absolute top-[35%] left-[45%] animate-float-slow">
        <div className="w-3 h-3 rounded-full bg-[#F2FCE2] opacity-70"></div>
      </div>
      
      {/* Medium dots (middle section) */}
      <div className="absolute top-[45%] right-[10%] animate-float">
        <div className="w-12 h-12 rounded-full bg-[#FDE1D3] opacity-30"></div>
      </div>
      <div className="absolute top-[50%] left-[15%] animate-float-delay">
        <div className="w-8 h-8 rounded-full bg-[#F1F0FB] opacity-40"></div>
      </div>
      <div className="absolute top-[48%] right-[35%] animate-float-slow">
        <div className="w-6 h-6 rounded-full bg-[#D3E4FD] opacity-55"></div>
      </div>
      <div className="absolute top-[42%] left-[30%] animate-float">
        <div className="w-4 h-4 rounded-full bg-[#FEF7CD] opacity-60"></div>
      </div>
      <div className="absolute top-[55%] right-[45%] animate-float-delay">
        <div className="w-7 h-7 rounded-full bg-[#FFDEE2] opacity-40"></div>
      </div>
      
      {/* Medium dots (middle-bottom section) */}
      <div className="absolute top-[65%] left-[25%] animate-float-slow">
        <div className="w-9 h-9 rounded-full bg-[#FEC6A1] opacity-45"></div>
      </div>
      <div className="absolute top-[60%] right-[20%] animate-float">
        <div className="w-5 h-5 rounded-full bg-[#E5DEFF] opacity-50"></div>
      </div>
      <div className="absolute top-[68%] left-[40%] animate-float-delay">
        <div className="w-6 h-6 rounded-full bg-[#F2FCE2] opacity-40"></div>
      </div>
      <div className="absolute top-[73%] right-[30%] animate-float-slow">
        <div className="w-4 h-4 rounded-full bg-[#FEF7CD] opacity-65"></div>
      </div>
      
      {/* Small dots (bottom section) */}
      <div className="absolute bottom-[20%] left-[10%] animate-float">
        <div className="w-8 h-8 rounded-full bg-[#D3E4FD] opacity-30"></div>
      </div>
      <div className="absolute bottom-[15%] right-[18%] animate-float-delay">
        <div className="w-3 h-3 rounded-full bg-[#FFDEE2] opacity-70"></div>
      </div>
      <div className="absolute bottom-[10%] left-[35%] animate-float-slow">
        <div className="w-5 h-5 rounded-full bg-[#FDE1D3] opacity-50"></div>
      </div>
      <div className="absolute bottom-[5%] right-[25%] animate-float">
        <div className="w-7 h-7 rounded-full bg-[#F1F0FB] opacity-40"></div>
      </div>
      <div className="absolute bottom-[12%] right-[40%] animate-float-delay">
        <div className="w-4 h-4 rounded-full bg-[#E5DEFF] opacity-60"></div>
      </div>
      <div className="absolute bottom-[8%] left-[20%] animate-float-slow">
        <div className="w-6 h-6 rounded-full bg-[#FEC6A1] opacity-35"></div>
      </div>
      
      {/* Extra tiny dots scattered around */}
      <div className="absolute top-[18%] left-[50%] animate-float">
        <div className="w-2 h-2 rounded-full bg-[#FEF7CD] opacity-70"></div>
      </div>
      <div className="absolute top-[38%] right-[55%] animate-float-delay">
        <div className="w-2 h-2 rounded-full bg-[#FFDEE2] opacity-75"></div>
      </div>
      <div className="absolute bottom-[30%] left-[60%] animate-float-slow">
        <div className="w-2 h-2 rounded-full bg-[#D3E4FD] opacity-70"></div>
      </div>
      <div className="absolute top-[80%] right-[8%] animate-float">
        <div className="w-2 h-2 rounded-full bg-[#F2FCE2] opacity-75"></div>
      </div>
      <div className="absolute top-[85%] left-[5%] animate-float-delay">
        <div className="w-2 h-2 rounded-full bg-[#F1F0FB] opacity-80"></div>
      </div>
    </div>
  );
};
