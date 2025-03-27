
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
      {/* Minimalist animated background effects - positioned at extreme edges */}
      <div 
        className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none"
      >
        <div className="absolute -top-40 -left-40 w-2/3 h-2/3 overflow-hidden">
          <FloatingElements />
        </div>
        <div className="absolute -bottom-40 -right-40 w-2/3 h-2/3 overflow-hidden">
          <FloatingElements />
        </div>
        <div className="absolute top-1/3 -right-52 w-1/3 h-1/3 overflow-hidden">
          <FloatingElements />
        </div>
        <div className="absolute -bottom-52 left-0 w-1/3 h-1/3 overflow-hidden">
          <FloatingElements />
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-6 space-y-8">
        {children}
      </div>
    </div>
  );
};
