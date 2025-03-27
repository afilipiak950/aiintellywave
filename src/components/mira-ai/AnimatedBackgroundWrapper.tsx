
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
      {/* Enhanced background effects */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <AnimatedAgents />
        <FloatingElements />
        <AnimatedBackground />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-6 space-y-8">
        {children}
      </div>
    </div>
  );
};
