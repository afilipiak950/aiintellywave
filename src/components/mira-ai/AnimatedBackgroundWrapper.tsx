
import React, { ReactNode } from 'react';
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { AnimatedBackground } from '@/components/leads/AnimatedBackground';

interface AnimatedBackgroundWrapperProps {
  children: ReactNode;
}

export const AnimatedBackgroundWrapper = ({ children }: AnimatedBackgroundWrapperProps) => {
  return (
    <div className="relative">
      {/* Enhanced background effects - now more spread out */}
      <div 
        className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none"
        style={{ 
          // Adjust positioning to spread elements more towards edges
          display: 'grid', 
          gridTemplateColumns: '1fr 3fr 1fr', 
          gridTemplateRows: '1fr 3fr 1fr' 
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <AnimatedAgents />
        </div>
        <div className="absolute bottom-0 right-0 w-full h-full overflow-hidden">
          <FloatingElements />
        </div>
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 overflow-hidden">
          <AnimatedBackground />
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-6 space-y-8">
        {children}
      </div>
    </div>
  );
};
