
import { useAuth } from '../../../context/auth';
import { useTranslation } from '../../../hooks/useTranslation';
import { motion } from 'framer-motion';
import { Sun, Moon, Cloud } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WelcomeSectionProps {
  className?: string;
}

const WelcomeSection = ({ className = '' }: WelcomeSectionProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [greeting, setGreeting] = useState<string>('');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay('morning');
      setGreeting(t('goodMorning'));
    } else if (hour < 18) {
      setTimeOfDay('afternoon');
      setGreeting(t('goodAfternoon'));
    } else {
      setTimeOfDay('evening');
      setGreeting(t('goodEvening'));
    }
  }, [t]);
  
  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'morning':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'afternoon':
        return <Cloud className="h-8 w-8 text-blue-400" />;
      case 'evening':
        return <Moon className="h-8 w-8 text-indigo-400" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };
  
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  const subtitleVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delay: 0.3,
        duration: 0.8
      }
    }
  };
  
  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    hover: {
      scale: 1.2,
      rotate: 15,
      transition: {
        duration: 0.3
      }
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl -z-10 opacity-70"></div>
      
      {/* Abstract shapes */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-20 -z-5"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-300 rounded-full blur-2xl opacity-20 -z-5"></div>
      
      <div className="flex items-center justify-between p-6 rounded-xl">
        <div>
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent"
            variants={titleVariants}
            initial="hidden"
            animate="visible"
          >
            {greeting}, {user?.firstName || t('customer')}
          </motion.h1>
          <motion.p 
            className="text-gray-600 mt-2"
            variants={subtitleVariants}
            initial="hidden"
            animate="visible"
          >
            {t('overview')}
          </motion.p>
        </div>
        
        <motion.div
          variants={iconVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="p-3 bg-white rounded-full shadow-md"
        >
          {getTimeIcon()}
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeSection;
