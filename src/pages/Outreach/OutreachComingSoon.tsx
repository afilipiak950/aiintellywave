
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { OutreachHeader } from '@/components/outreach/OutreachHeader';
import { OutreachSubscriptionForm } from '@/components/outreach/OutreachSubscriptionForm';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { useTranslation } from '@/hooks/useTranslation';
import { AnimatedBackground } from '@/components/appointments/AnimatedBackground';
import { motion } from 'framer-motion';

const OutreachComingSoon = () => {
  const { language } = useTranslation();
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-background to-indigo-950/20">
      {/* Animated background with particles */}
      <AnimatedBackground />
      
      {/* Background animated agents - reduced opacity */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <AnimatedAgents />
      </div>
      
      {/* Floating elements - using the updated component */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingElements />
      </div>
      
      <div className="container relative z-10 px-4 py-24 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <OutreachHeader language={language} />
          <OutreachSubscriptionForm language={language} />
        </motion.div>
      </div>
    </div>
  );
};

export default OutreachComingSoon;
