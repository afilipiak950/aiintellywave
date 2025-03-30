
import { InteractiveAIBackground } from '@/components/ui/interactive-ai-background';
import { ReactNode } from 'react';

interface LeadDatabaseContainerProps {
  children: ReactNode;
}

const LeadDatabaseContainer = ({ children }: LeadDatabaseContainerProps) => {
  return (
    <div className="relative">
      {/* Enhanced background with interactive AI elements */}
      <InteractiveAIBackground 
        className="absolute inset-0"
        density="medium"
        speed="medium"
      >
        <div className="relative z-10 container mx-auto py-6 space-y-8">
          {children}
        </div>
      </InteractiveAIBackground>
    </div>
  );
};

export default LeadDatabaseContainer;
