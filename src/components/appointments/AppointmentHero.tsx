
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const AppointmentHero = () => {
  const { t } = useTranslation();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center pt-8 pb-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="inline-block mb-4"
      >
        <div className="bg-primary/10 p-4 rounded-full">
          <Calendar size={40} className="text-primary" />
        </div>
      </motion.div>
      
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold mb-4"
      >
        {t('scheduleConsultation')}
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-muted-foreground max-w-2xl mx-auto px-4"
      >
        {t('appointmentDescription')}
      </motion.p>
    </motion.div>
  );
};
