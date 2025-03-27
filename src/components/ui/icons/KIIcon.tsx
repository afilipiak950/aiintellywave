
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
        {/* AI text */}
        <path 
          d="M17 7.5L14 16.5M20 7.5L20 16.5M10.5 7.5L7.5 12L10.5 16.5" 
          className="stroke-current" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Stars */}
        <path 
          d="M5 10L4 9L5 8L6 9L5 10Z" 
          className="fill-current" 
        />
        <path 
          d="M7 7L5.5 5.5L7 4L8.5 5.5L7 7Z" 
          className="fill-current" 
        />
        <path 
          d="M4 14L3 13L4 12L5 13L4 14Z" 
          className="fill-current" 
        />
      </svg>
    </div>
  );
};

export default KIIcon;
