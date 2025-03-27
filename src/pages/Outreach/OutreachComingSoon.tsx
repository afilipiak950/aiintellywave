
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { OutreachHeader } from '@/components/outreach/OutreachHeader';
import { OutreachSubscriptionForm } from '@/components/outreach/OutreachSubscriptionForm';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { useTranslation } from '@/hooks/useTranslation';

const OutreachComingSoon = () => {
  const { language } = useTranslation();
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-background to-indigo-950/20">
      {/* Background animated agents */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <AnimatedAgents />
      </div>
      
      <div className="container relative z-10 px-4 py-24 mx-auto max-w-5xl">
        <OutreachHeader language={language} />
        <OutreachSubscriptionForm language={language} />
        
        {/* Floating elements animation */}
        <FloatingElements />
      </div>
    </div>
  );
};

export default OutreachComingSoon;
