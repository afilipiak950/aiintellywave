
import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/appointments/AnimatedBackground';

const MiraAI = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Simulate loading time for animations
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    const animationTimer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(animationTimer);
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Animated background with particles */}
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={`transition-all duration-1000 ease-out ${isLoading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">MIRA AI Assistant</h1>
            </div>
            <p className="text-muted-foreground max-w-3xl">
              Interact with our advanced AI assistant to get help, insights, and answers to your questions. MIRA is designed to understand context and provide relevant responses.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className={`relative bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl overflow-hidden transition-all duration-700 ease-out border border-primary/10 shadow-lg ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full bg-primary/5"
                  style={{
                    width: `${Math.random() * 300 + 100}px`,
                    height: `${Math.random() * 300 + 100}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${Math.random() * 20 + 10}s ${Math.random() * 5}s infinite ease-in-out`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading MIRA AI...</p>
              </div>
            </div>
          )}

          {/* Iframe container */}
          <div 
            className={`w-full transition-opacity duration-500 ${animationComplete ? 'opacity-100' : 'opacity-0'}`}
            style={{ height: "700px" }}
          >
            <iframe
              src="https://www.chatbase.co/chatbot-iframe/WYt_wu0y3qZMyNLTWhp4p"
              width="100%"
              style={{ height: "100%", minHeight: "700px" }}
              frameBorder="0"
              title="MIRA AI Chat"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MiraAI;
