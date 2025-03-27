
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }).map((_, i) => {
    const colors = [
      'rgba(148, 163, 184, 0.1)',  // slate-400
      'rgba(99, 102, 241, 0.08)',   // indigo-500
      'rgba(14, 165, 233, 0.05)',   // sky-500
      'rgba(168, 85, 247, 0.07)',   // purple-500
    ];
    
    return {
      id: i,
      x: Math.random() * 100, // % position
      y: Math.random() * 100,
      size: Math.random() * 60 + 40, // Size between 40 and 100
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 20 + 15, // Duration between 15 and 35 seconds
      delay: Math.random() * -20, // Random delay for more natural movement
    };
  });
};

export const AnimatedBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    // Generate more particles for larger screens
    const particleCount = window.innerWidth > 768 ? 12 : 8;
    setParticles(generateParticles(particleCount));
    
    // Regenerate particles on resize
    const handleResize = () => {
      const newCount = window.innerWidth > 768 ? 12 : 8;
      setParticles(generateParticles(newCount));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full blur-3xl"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
          }}
          animate={{
            x: [
              `${Math.random() * 10 - 5}%`,
              `${Math.random() * 10 - 5}%`,
              `${Math.random() * 10 - 5}%`,
              `${Math.random() * 10 - 5}%`
            ],
            y: [
              `${Math.random() * 10 - 5}%`,
              `${Math.random() * 10 - 5}%`,
              `${Math.random() * 10 - 5}%`,
              `${Math.random() * 10 - 5}%`
            ],
            scale: [1, 1.2, 0.9, 1.1, 1],
            opacity: [0.4, 0.7, 0.5, 0.6, 0.4],
          }}
          transition={{
            duration: particle.duration,
            times: [0, 0.25, 0.5, 0.75, 1],
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
