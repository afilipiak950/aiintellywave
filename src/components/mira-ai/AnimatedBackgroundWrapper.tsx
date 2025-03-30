
import React, { ReactNode } from 'react';
import { InteractiveAIBackground } from '@/components/ui/interactive-ai-background';

interface AnimatedBackgroundWrapperProps {
  children: ReactNode;
}

export const AnimatedBackgroundWrapper = ({ children }: AnimatedBackgroundWrapperProps) => {
  return (
    <InteractiveAIBackground 
      className="min-h-[calc(100vh-4rem)]"
      density="medium"
      speed="medium"
    >
      <div className="relative z-10 container mx-auto px-4 py-6 space-y-8">
        {children}
      </div>
    </InteractiveAIBackground>
  );
};
