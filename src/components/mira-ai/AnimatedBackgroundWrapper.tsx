
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
      {/* Enhanced background effects - pushed further to the edges */}
      <div 
        className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none"
      >
        <div className="absolute -top-20 -left-20 w-2/3 h-2/3 overflow-hidden">
          <AnimatedAgents />
        </div>
        <div className="absolute -bottom-20 -right-20 w-2/3 h-2/3 overflow-hidden">
          <FloatingElements />
        </div>
        <div className="absolute top-1/2 -right-32 w-1/2 h-1/2 overflow-hidden">
          <AnimatedBackground />
        </div>
        <div className="absolute -bottom-32 left-10 w-1/2 h-1/2 overflow-hidden">
          <AnimatedBackground />
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-6 space-y-8">
        {children}
      </div>
    </div>
  );
};
