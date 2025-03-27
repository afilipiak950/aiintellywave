
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
      {/* Enhanced animated background effects - positioned further at extreme edges */}
      <div 
        className="absolute inset-0 overflow-hidden opacity-60 pointer-events-none"
      >
        <div className="absolute -top-60 -left-60 w-full h-full overflow-hidden">
          <FloatingElements />
        </div>
        <div className="absolute -bottom-60 -right-60 w-full h-full overflow-hidden">
          <FloatingElements />
        </div>
        <div className="absolute top-1/4 -right-80 w-full h-full overflow-hidden">
          <FloatingElements />
        </div>
        <div className="absolute -bottom-80 left-0 w-full h-full overflow-hidden">
          <FloatingElements />
        </div>
        
        {/* Add more floating elements for better coverage */}
        <div className="absolute -top-20 right-1/4 w-full h-full overflow-hidden">
          <FloatingElements />
        </div>
        <div className="absolute top-2/3 -left-60 w-full h-full overflow-hidden">
          <FloatingElements />
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-6 space-y-8">
        {children}
      </div>
    </div>
  );
};
