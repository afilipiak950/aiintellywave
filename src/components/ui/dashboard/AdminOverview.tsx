
import { TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedAgents } from '../animated-agents';
import { FlyingAvatars } from '../flying-avatars';
import { useState } from 'react';

const AdminOverview = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  const statsItems = [
    { label: "User Growth", value: "+24%", subtext: "vs. last quarter" },
    { label: "Project Completion", value: "87%", subtext: "success rate" },
    { label: "System Health", value: "99.9%", subtext: "uptime this month" }
  ];

  return (
    <div 
      className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm overflow-hidden lg:col-span-2 relative p-6 h-64 transform hover:shadow-xl transition-all duration-300"
      onMouseLeave={() => setHovered(null)}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="opacity-20">
          <AnimatedAgents 
            density="medium"
            showAvatars={true}
            pulseEffect={true}
            clickEffects={true}
          />
        </div>
        <FlyingAvatars count={3} speed="medium" />
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-medium mb-2 flex items-center">
          Admin Dashboard Overview
          <Sparkles className="ml-2 w-4 h-4 text-yellow-300 animate-pulse" />
        </h3>
        <p className="text-blue-100 mb-4">Interactive visualization of your system activities</p>
        
        <div className="grid grid-cols-3 gap-4">
          {statsItems.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
              style={{ animationDelay: `${0.1 * index}s` }}
              onMouseEnter={() => setHovered(index)}
              whileHover={{ scale: 1.05 }}
            >
              <h4 className="font-medium text-lg">{item.label}</h4>
              <div className="text-3xl font-bold mt-2">{item.value}</div>
              <p className="text-sm text-blue-100 mt-1">{item.subtext}</p>
              
              {/* Interactive background effect when hovered */}
              {hovered === index && (
                <motion.div 
                  className="absolute inset-0 bg-white/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              
              {/* Particle effects on hover */}
              {hovered === index && (
                <motion.div 
                  className="absolute -right-2 -bottom-2 w-20 h-20 opacity-30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative w-full h-full">
                    <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8" />
                    <motion.div 
                      className="absolute top-1/2 left-1/2 w-full h-full bg-blue-400 rounded-full"
                      initial={{ scale: 0.3, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                      style={{ 
                        translateX: "-50%", 
                        translateY: "-50%",
                        filter: "blur(8px)"
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
