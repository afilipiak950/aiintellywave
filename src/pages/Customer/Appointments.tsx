
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MessageSquare, HelpCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { CalendlyIntegration } from '../../components/appointments/CalendlyIntegration';
import { AppointmentFeatures } from '../../components/appointments/AppointmentFeatures';
import { AppointmentHero } from '../../components/appointments/AppointmentHero';
import { AnimatedBackground } from '../../components/appointments/AnimatedBackground';

const Appointments = () => {
  const { t } = useTranslation();
  
  // Set page title when component mounts
  useEffect(() => {
    document.title = `${t('appointments')} | Intellywave`;
  }, [t]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Animated background with particles */}
      <AnimatedBackground />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Hero section with title and description */}
        <AppointmentHero />
        
        {/* Features section */}
        <AppointmentFeatures />
        
        {/* Calendly integration */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 mb-12 max-w-5xl mx-auto bg-white/80 dark:bg-sidebar/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">{t('selectDateTime')}</h2>
          <CalendlyIntegration />
        </motion.div>
      </div>
    </div>
  );
};

export default Appointments;
