
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { AnimatedBackground } from '@/components/leads/AnimatedBackground';
import { ReactNode } from 'react';

interface LeadDatabaseContainerProps {
  children: ReactNode;
}

const LeadDatabaseContainer = ({ children }: LeadDatabaseContainerProps) => {
  return (
    <div className="relative">
      {/* Enhanced background effects with all three animated components */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <AnimatedAgents />
        <FloatingElements />
        <AnimatedBackground />
      </div>
      
      <div className="relative z-10 container mx-auto py-6 space-y-8">
        {children}
      </div>
    </div>
  );
};

export default LeadDatabaseContainer;
