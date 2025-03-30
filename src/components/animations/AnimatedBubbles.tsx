
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Bubble = {
  id: number;
  size: number;
  x: number;
  y: number;
  color: string;
  duration: number;
  delay: number;
};

export const AnimatedBubbles: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  
  useEffect(() => {
    // Erstellen von zufälligen Bubbles
    const generateBubbles = () => {
      const bubblesCount = window.innerWidth < 768 ? 12 : 20;
      const colors = [
        '#E5DEFF', // Soft purple
        '#FEC6A1', // Soft orange
        '#FFDEE2', // Soft pink
        '#D3E4FD', // Soft blue
        '#F2FCE2', // Soft green
        '#FEF7CD', // Soft yellow
        '#FDE1D3', // Soft peach
        '#F1F0FB', // Soft gray
      ];
      
      return Array.from({ length: bubblesCount }).map((_, i) => ({
        id: i,
        size: Math.random() * 60 + 20, // Größe zwischen 20 und 80px
        x: Math.random() * 100, // Position in Prozent
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 15 + 15, // Dauer zwischen 15 und 30 Sekunden
        delay: Math.random() * -10, // Zufällige Startverzögerung
      }));
    };
    
    setBubbles(generateBubbles());
    
    // Anpassung bei Größenänderung des Fensters
    const handleResize = () => {
      setBubbles(generateBubbles());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map(bubble => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full opacity-50"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            backgroundColor: bubble.color,
          }}
          animate={{
            x: [
              `${Math.random() * 20 - 10}%`,
              `${Math.random() * 20 - 10}%`,
              `${Math.random() * 20 - 10}%`,
              `${Math.random() * 20 - 10}%`,
            ],
            y: [
              `${Math.random() * 20 - 10}%`,
              `${Math.random() * 20 - 10}%`,
              `${Math.random() * 20 - 10}%`,
              `${Math.random() * 20 - 10}%`,
            ],
            opacity: [0.4, 0.6, 0.5, 0.4],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: bubble.duration,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            delay: bubble.delay
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBubbles;
