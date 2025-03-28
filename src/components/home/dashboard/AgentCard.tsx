
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export interface AgentData {
  id: string;
  title: string;
  icon: ReactNode;
  color: string;
  description: string;
  features: string[];
}

interface AgentCardProps {
  agent: AgentData;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const AgentCard = ({ agent, index, isActive, onClick }: AgentCardProps) => {
  return (
    <motion.div
      onClick={onClick}
      className="relative cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className={`flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br ${agent.color} shadow-lg hover:shadow-xl transition-all duration-300 w-48 h-48 md:w-52 md:h-52`}
      >
        <div className="text-white mb-4 bg-white/20 p-3 rounded-full">
          {agent.icon}
        </div>
        <span className="text-white text-lg font-medium text-center">
          {agent.title}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default AgentCard;
