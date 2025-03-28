
import { useState } from 'react';
import AgentCard, { AgentData } from './AgentCard';
import AgentDetails from './AgentDetails';
import { AnimatePresence } from 'framer-motion';

interface AgentsListProps {
  agents: AgentData[];
}

const AgentsList = ({ agents }: AgentsListProps) => {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  
  const handleAgentClick = (agentId: string) => {
    setActiveAgent(activeAgent === agentId ? null : agentId);
  };

  const activeAgentData = agents.find(agent => agent.id === activeAgent) || null;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-5 mb-8">
        {agents.map((agent, index) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            index={index}
            isActive={activeAgent === agent.id}
            onClick={() => handleAgentClick(agent.id)}
          />
        ))}
      </div>
      
      <AnimatePresence>
        {activeAgent && <AgentDetails agent={activeAgentData} />}
      </AnimatePresence>
    </div>
  );
};

export default AgentsList;
