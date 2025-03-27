
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
        {/* Glowing star/sparkle path */}
        <path 
          d="M12 2L14.4186 9.5814L22 12L14.4186 14.4186L12 22L9.5814 14.4186L2 12L9.5814 9.5814L12 2Z" 
          className="fill-current opacity-70 transition-all duration-300 group-hover:opacity-100" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Subtle glow effect */}
        <filter id="glowEffect">
          <feGaussianBlur className="text-primary" stdDeviation="3" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.27 0 0 0 0 0.52 0 0 0 0 0.96 0 0 0 0.5 0" />
        </filter>
        
        {/* Outer glow */}
        <path 
          d="M12 2L14.4186 9.5814L22 12L14.4186 14.4186L12 22L9.5814 14.4186L2 12L9.5814 9.5814L12 2Z" 
          fill="currentColor" 
          opacity="0.2" 
          filter="url(#glowEffect)"
        />
      </svg>
    </div>
  );
};

export default KIIcon;
