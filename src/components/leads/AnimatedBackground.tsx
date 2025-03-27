
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
      'rgba(99, 102, 241, 0.08)',   // indigo-500
      'rgba(139, 92, 246, 0.07)',   // violet-500
      'rgba(236, 72, 153, 0.06)',   // pink-500
      'rgba(14, 165, 233, 0.05)',   // sky-500
      'rgba(244, 114, 182, 0.07)',  // pink-400
      'rgba(79, 70, 229, 0.06)',    // indigo-600
    ];
    
    return {
      id: i,
      x: Math.random() * 100, // % position
      y: Math.random() * 100,
      size: Math.random() * 80 + 40, // Size between 40 and 120
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 30 + 15, // Duration between 15 and 45 seconds
      delay: Math.random() * -20, // Random delay for more natural movement
    };
  });
};

export const AnimatedBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    // Generate more particles for larger screens
    const particleCount = window.innerWidth > 768 ? 15 : 10;
    setParticles(generateParticles(particleCount));
    
    // Regenerate particles on resize
    const handleResize = () => {
      const newCount = window.innerWidth > 768 ? 15 : 10;
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
              `${Math.random() * 15 - 7}%`,
              `${Math.random() * 15 - 7}%`,
              `${Math.random() * 15 - 7}%`,
              `${Math.random() * 15 - 7}%`,
              `${Math.random() * 15 - 7}%`
            ],
            y: [
              `${Math.random() * 15 - 7}%`,
              `${Math.random() * 15 - 7}%`,
              `${Math.random() * 15 - 7}%`,
              `${Math.random() * 15 - 7}%`,
              `${Math.random() * 15 - 7}%`
            ],
            scale: [1, 1.3, 0.8, 1.2, 1],
            opacity: [0.3, 0.8, 0.5, 0.7, 0.3],
          }}
          transition={{
            duration: particle.duration,
            times: [0, 0.2, 0.5, 0.8, 1],
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
