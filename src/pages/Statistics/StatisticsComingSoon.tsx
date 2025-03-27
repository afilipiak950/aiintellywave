
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { useTranslation } from '@/hooks/useTranslation';
import { AnimatedBackground } from '@/components/appointments/AnimatedBackground';
import { motion } from 'framer-motion';
import { BarChart3, Sparkles } from 'lucide-react';
import { Language } from '@/utils/languageTypes';
import { getTranslation } from '@/utils/languageUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Similar structure to OutreachHeader, but for Statistics
const StatisticsHeader: React.FC<{ language: Language }> = ({ language }) => {
  const t = (key: Parameters<typeof getTranslation>[1]): string => getTranslation(language, key);

  return (
    <div className="text-center mb-12">
      <div className="inline-block mb-4">
        <div className="relative inline-flex items-center justify-center p-3 bg-primary/10 rounded-full animate-pulse">
          <BarChart3 className="w-10 h-10 text-primary" />
        </div>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 animate-fade-in">
        {t('comingSoon')}
      </h1>
      
      <div className="flex items-center justify-center gap-2 mb-8">
        <span className="h-px w-8 bg-primary/40"></span>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground/90 inline-flex items-center">
          {t('STATISTICS')} <Sparkles className="ml-2 w-6 h-6 text-primary animate-bounce" />
        </h2>
        <span className="h-px w-8 bg-primary/40"></span>
      </div>
      
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
        Erweiterte Statistiken und Datenanalysen kommen bald, um Ihnen detaillierte Einblicke in Ihre Projekte zu bieten.
      </p>
    </div>
  );
};

// Similar to OutreachSubscriptionForm
const StatisticsNotificationForm: React.FC<{ language: Language }> = ({ language }) => {
  const t = (key: Parameters<typeof getTranslation>[1]): string => getTranslation(language, key);

  return (
    <Card className="max-w-lg mx-auto p-6 backdrop-blur-sm bg-background/70 border-primary/20 shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <h3 className="text-xl font-medium mb-4 flex items-center justify-center">
        <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
        {t('stayUpdated')}
      </h3>
      
      <form className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder={t('emailPlaceholder')}
          className="flex-1"
        />
        <Button 
          type="submit" 
          className="whitespace-nowrap"
        >
          {t('notifyMe')}
        </Button>
      </form>
    </Card>
  );
};

const StatisticsComingSoon = () => {
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
          <StatisticsHeader language={language} />
          <StatisticsNotificationForm language={language} />
        </motion.div>
      </div>
    </div>
  );
};

export default StatisticsComingSoon;
