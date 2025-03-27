
import React from 'react';

interface KIIconProps {
  className?: string;
  size?: number;
}

const KIIcon = ({ className = "", size = 20 }: KIIconProps) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" className="stroke-current" strokeWidth="1.5" />
        <path 
          d="M7.5 7.5V16.5M7.5 12H10.5M10.5 12L13.5 7.5M10.5 12L13.5 16.5M16.5 7.5V16.5" 
          className="stroke-current" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default KIIcon;
