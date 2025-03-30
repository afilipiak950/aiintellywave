
import React from 'react';
import { AnimatedAgents } from './animated-agents';
import { FlyingAvatars } from './flying-avatars';

interface InteractiveAIBackgroundProps {
  children?: React.ReactNode;
  density?: 'low' | 'medium' | 'high';
  speed?: 'slow' | 'medium' | 'fast';
  showAgents?: boolean;
  showAvatars?: boolean;
  interactive?: boolean;
  className?: string;
}

export const InteractiveAIBackground: React.FC<InteractiveAIBackgroundProps> = ({
  children,
  density = 'medium',
  speed = 'medium',
  showAgents = true,
  showAvatars = true,
  interactive = true,
  className
}) => {
  return (
    <div className={`relative overflow-hidden ${className || ''}`}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {showAgents && (
          <AnimatedAgents 
            density={density} 
            speed={speed} 
            interactive={interactive}
          />
        )}
        
        {showAvatars && (
          <FlyingAvatars 
            count={density === 'low' ? 3 : density === 'medium' ? 5 : 8} 
            speed={speed}
            interactive={interactive}
          />
        )}
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
