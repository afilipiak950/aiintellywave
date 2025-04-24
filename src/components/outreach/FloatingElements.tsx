
import React from 'react';
import { motion } from 'framer-motion';

export const FloatingElements: React.FC = () => {
  // Create an array of elements with random positions and sizes
  const elements = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 30 + 10,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {elements.map((element) => {
        const shape = Math.random() > 0.5 ? 'circle' : 'rect';
        
        return shape === 'circle' ? (
          <motion.div
            key={element.id}
            className="absolute rounded-full bg-indigo-500 opacity-5"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: element.size,
              height: element.size,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.05, 0.08, 0.05]
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              delay: element.delay,
              ease: "easeInOut"
            }}
          />
        ) : (
          <motion.div
            key={element.id}
            className="absolute bg-primary opacity-5 rotate-45"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: element.size,
              height: element.size,
            }}
            animate={{
              rotate: [45, 90, 45],
              opacity: [0.05, 0.08, 0.05]
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              delay: element.delay,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </div>
  );
};
