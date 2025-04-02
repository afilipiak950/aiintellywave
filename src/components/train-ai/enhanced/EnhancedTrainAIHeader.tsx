
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Zap, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const EnhancedTrainAIHeader: React.FC = () => {
  return (
    <motion.div 
      className="relative overflow-hidden rounded-xl p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 opacity-90"></div>
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center mix-blend-soft-light opacity-30"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full blur-lg transform scale-110"></div>
              <div className="bg-white/90 p-3 rounded-full relative z-10">
                <Brain size={36} className="text-indigo-600" />
              </div>
            </motion.div>
            
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">Neural Trainer</h1>
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
                  Beta
                </Badge>
              </div>
              <p className="text-white/80 mt-1">
                Transform websites into intelligent AI knowledge bases
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <motion.div 
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full text-white text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={16} />
              <span>Auto-AI</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full text-white text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap size={16} />
              <span>Supercharged</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full text-white text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe size={16} />
              <span>Web Crawler</span>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          className="mt-6 max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-white/90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <p className="text-lg">
            Train our neural network on any website to generate comprehensive summaries and FAQs. 
            Use the extracted knowledge to power your own AI applications or chatbots.
          </p>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-4 left-1/4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
    </motion.div>
  );
};
