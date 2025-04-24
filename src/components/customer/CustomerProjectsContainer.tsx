
import React from 'react';
import { AIThemeElements } from '../ui/ai-elements/AIThemeElements';
import { AIDecorator, AIDecorativeBanner } from '../ui/ai-elements/AIDecorators';
import { motion } from 'framer-motion';

interface CustomerProjectsContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const CustomerProjectsContainer: React.FC<CustomerProjectsContainerProps> = ({ 
  children, 
  title = "Your Projects",
  subtitle = "Manage and view all your active projects"
}) => {
  return (
    <div className="relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none z-0">
        <AIThemeElements variant="sparse" className="opacity-30" />
        <AIDecorator type="circuit" className="top-10 right-10 text-blue-400 opacity-30" />
        <AIDecorator type="nodes" className="bottom-40 left-10 text-indigo-400 opacity-20" />
      </div>
      
      {/* Header banner with animations */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mb-6"
      >
        <AIDecorativeBanner className="h-32 mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-1">
              {title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {subtitle}
            </p>
          </div>
        </AIDecorativeBanner>
      </motion.div>
      
      {/* Main content with staggered animation */}
      <motion.div 
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default CustomerProjectsContainer;
