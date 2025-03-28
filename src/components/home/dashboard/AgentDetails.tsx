
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentData } from './AgentCard';

interface AgentDetailsProps {
  agent: AgentData | null;
}

const AgentDetails = ({ agent }: AgentDetailsProps) => {
  if (!agent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-blue-200 dark:border-blue-800 text-gray-800 dark:text-white p-6 rounded-lg mb-6 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center">
            <div className={`p-3 rounded-md bg-gradient-to-r ${agent.color} mr-4`}>
              {agent.icon}
            </div>
            <div>
              <h4 className="font-bold text-xl">{agent.title}</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{agent.description}</p>
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            {agent.features.map((feature, idx) => (
              <motion.div 
                key={idx} 
                className="flex items-center text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
          
          <div className="pt-4 flex flex-wrap gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Jetzt chatten
            </Button>
            <Button variant="outline" className="border-blue-200 dark:border-blue-800 flex items-center gap-2">
              <Link className="h-4 w-4" />
              Mehr erfahren
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default AgentDetails;
