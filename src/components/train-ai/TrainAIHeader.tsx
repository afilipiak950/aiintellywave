
import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export const TrainAIHeader: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 mb-8">
      <div className="relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-3"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Brain size={48} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white">Train AI on External Websites</h1>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-2 text-lg text-white/90 max-w-2xl"
        >
          Generate comprehensive summaries and FAQs by crawling any website. Train our AI to understand and analyze web content in minutes.
        </motion.p>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
      <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-white/10 rounded-full -mb-10 blur-xl"></div>
      
      {/* Animated dots */}
      <motion.div
        className="absolute right-10 bottom-10 size-2 rounded-full bg-white/60"
        animate={{ 
          opacity: [0.4, 0.8, 0.4],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute right-20 bottom-16 size-1 rounded-full bg-white/60"
        animate={{ 
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute right-16 bottom-6 size-1.5 rounded-full bg-white/60"
        animate={{ 
          opacity: [0.5, 0.9, 0.5],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 3.5, repeat: Infinity }}
      />
    </div>
  );
};
