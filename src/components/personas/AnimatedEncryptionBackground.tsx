
import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedEncryptionBackgroundProps {
  active?: boolean;
  type?: 'email' | 'linkedin' | 'xing';
}

const AnimatedEncryptionBackground: React.FC<AnimatedEncryptionBackgroundProps> = ({ 
  active = true,
  type = 'email'
}) => {
  // Different patterns based on integration type
  const getGradient = () => {
    switch(type) {
      case 'linkedin':
        return "linear-gradient(225deg, #0077B5 0%, #00669e 100%)";
      case 'xing':
        return "linear-gradient(225deg, #006567 0%, #004e4f 100%)";
      case 'email':
      default:
        return "linear-gradient(225deg, #6366f1 0%, #4f46e5 100%)";
    }
  };

  const getPatternOpacity = () => {
    return active ? 0.04 : 0.02;
  };
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Background gradient */}
      <motion.div 
        className="absolute inset-0 rounded-lg opacity-5"
        style={{ background: getGradient() }}
        initial={{ opacity: 0.03 }}
        animate={{ opacity: active ? 0.07 : 0.03 }}
        transition={{ duration: 1.5 }}
      />
      
      {/* Circuit pattern */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0.02 }}
        animate={{ opacity: getPatternOpacity() }}
        transition={{ duration: 1 }}
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none'/%3E%3Cpath d='M20 20h60v60H20z' stroke='%23000' stroke-width='1' fill='none'/%3E%3Cpath d='M30 30h40v40H30z' stroke='%23000' stroke-width='1' fill='none'/%3E%3Cpath d='M40 20v60M60 20v60M20 40h60M20 60h60' stroke='%23000' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat"
        }}
      />
      
      {/* Animated particles */}
      {active && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 rounded-full bg-primary/30"
              style={{ 
                left: `${20 + (i * 30)}%`,
                top: '50%'
              }}
              animate={{
                y: [0, -10, 0, 10, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.8
              }}
            />
          ))}
        </>
      )}
      
      {/* Digital data strings */}
      {active && (
        <motion.div
          className="absolute bottom-2 left-0 right-0 flex justify-center text-[8px] text-primary/20 font-mono"
          animate={{
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          0xA4F3E1...5BC2D9
        </motion.div>
      )}
    </div>
  );
};

export default AnimatedEncryptionBackground;
