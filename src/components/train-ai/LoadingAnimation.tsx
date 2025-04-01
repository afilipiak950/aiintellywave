
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, Globe, FileText, HelpCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface LoadingAnimationProps {
  progress: number;
  stage: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ progress, stage }) => {
  // Get the appropriate icon based on the current stage
  const getStageIcon = () => {
    if (progress < 30) return <Globe className="text-primary" size={20} />;
    if (progress < 60) return <FileText className="text-primary" size={20} />;
    if (progress < 85) return <Brain className="text-primary" size={20} />;
    return <HelpCircle className="text-primary" size={20} />;
  };
  
  // Get detailed message based on progress
  const getDetailedMessage = () => {
    if (progress < 10) return "Connecting to website...";
    if (progress < 30) return "Extracting content from pages...";
    if (progress < 45) return "Processing text content...";
    if (progress < 60) return "Organizing information...";
    if (progress < 75) return "Drafting comprehensive summary...";
    if (progress < 85) return "Refining summary details...";
    if (progress < 95) return "Generating relevant FAQs...";
    return "Finalizing results...";
  };
  
  return (
    <motion.div
      key="loading-animation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-8"
    >
      <div className="relative w-24 h-24 mb-6">
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-100 dark:bg-purple-900/30"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-purple-200 dark:bg-purple-800/30"
          animate={{ 
            scale: [1, 1.15, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
        />
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            rotate: [0, 10, -10, 0],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <Brain size={40} className="text-primary" />
        </motion.div>
        <motion.div 
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "linear" 
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4,6"
              className="text-primary/40"
            />
          </svg>
        </motion.div>
      </div>

      <h3 className="text-xl font-medium mb-2">
        {stage}
      </h3>
      
      <div className="w-full max-w-sm mb-4">
        <Progress 
          value={progress} 
          className="h-2"
          indicatorClassName="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" 
        />
        <div className="mt-2 text-right text-sm text-gray-500">
          {Math.round(progress)}% Complete
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{getDetailedMessage()}</span>
      </div>
      
      <div className="flex items-center gap-3 mt-6 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-md w-full">
        <div className="flex-shrink-0">
          {getStageIcon()}
        </div>
        <div className="flex-grow">
          <p className="font-medium mb-1">Background Processing</p>
          <p className="text-xs">
            This process will continue in the background even if you leave this page. You can come back at any time to see the results.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
