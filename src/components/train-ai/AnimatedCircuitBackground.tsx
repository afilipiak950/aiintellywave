
import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedCircuitBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 opacity-10 pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circuit-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
            <motion.path
              d="M10,30 Q20,20 30,30 T50,30 T70,30 T90,30"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ 
                pathLength: 1,
                transition: { duration: 4, repeat: Infinity, repeatType: "loop" }
              }}
            />
            <motion.path
              d="M20,10 L20,90 M40,10 L40,90 M60,10 L60,90 M80,10 L80,90"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4,4"
              fill="none"
              initial={{ strokeDashoffset: 0 }}
              animate={{ 
                strokeDashoffset: -20,
                transition: { duration: 10, repeat: Infinity, repeatType: "loop" }
              }}
            />
            <motion.circle 
              cx="10" 
              cy="10" 
              r="3" 
              fill="currentColor"
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: 1.2,
                transition: { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
              }}
            />
            <motion.circle 
              cx="30" 
              cy="70" 
              r="2" 
              fill="currentColor"
              initial={{ scale: 1 }}
              animate={{ 
                scale: 1.4,
                transition: { duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
              }}
            />
            <motion.circle 
              cx="70" 
              cy="20" 
              r="2" 
              fill="currentColor"
              initial={{ scale: 0.9 }}
              animate={{ 
                scale: 1.3,
                transition: { duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
              }}
            />
            <motion.rect 
              x="80" 
              y="60" 
              width="6" 
              height="6" 
              fill="none" 
              stroke="currentColor"
              initial={{ rotate: 0 }}
              animate={{ 
                rotate: 90,
                transition: { duration: 4, repeat: Infinity, repeatType: "loop" }
              }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
      </svg>
    </div>
  );
};
