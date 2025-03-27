
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
        {/* Simplified sparkle path */}
        <path 
          d="M12 3L14.09 8.26L20 9.27L15.5 13.97L16.18 20L12 17.77L7.82 20L8.5 13.97L4 9.27L9.91 8.26L12 3Z" 
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
          d="M12 3L14.09 8.26L20 9.27L15.5 13.97L16.18 20L12 17.77L7.82 20L8.5 13.97L4 9.27L9.91 8.26L12 3Z" 
          fill="currentColor" 
          opacity="0.2" 
          filter="url(#glowEffect)"
        />
      </svg>
    </div>
  );
};

export default KIIcon;
