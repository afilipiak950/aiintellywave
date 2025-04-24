
import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedAgents: React.FC = () => {
  // Generate random dots
  const dots = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5
  }));

  // Generate random connections between dots
  const connections = dots.flatMap((dot, i) => 
    dots
      .slice(i + 1, i + 3)
      .filter(() => Math.random() > 0.3)
      .map(otherDot => ({ 
        id: `${dot.id}-${otherDot.id}`, 
        from: dot, 
        to: otherDot 
      }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full">
        {/* Connections between dots */}
        {connections.map(connection => (
          <motion.line
            key={connection.id}
            x1={`${connection.from.x}%`}
            y1={`${connection.from.y}%`}
            x2={`${connection.to.x}%`}
            y2={`${connection.to.y}%`}
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 0.3,
              transition: { 
                duration: 2,
                delay: Math.min(connection.from.delay, connection.to.delay)
              }
            }}
          />
        ))}
        
        {/* Dots */}
        {dots.map(dot => (
          <motion.circle
            key={dot.id}
            cx={`${dot.x}%`}
            cy={`${dot.y}%`}
            r={dot.size}
            fill="currentColor"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1,
              opacity: 0.7,
              transition: { delay: dot.delay, duration: 1 }
            }}
            whileHover={{ scale: 1.5, opacity: 1 }}
          >
            <animate 
              attributeName="opacity" 
              values="0.3;0.7;0.3" 
              dur={`${3 + dot.delay}s`}
              repeatCount="indefinite"
            />
            <animate 
              attributeName="r" 
              values={`${dot.size};${dot.size * 1.2};${dot.size}`}
              dur={`${2 + dot.delay}s`}
              repeatCount="indefinite"
            />
          </motion.circle>
        ))}
      </svg>
    </div>
  );
};
