
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BriefcaseIcon, UserIcon, SearchIcon, MessageSquare, TrendingUp, Users, Link } from 'lucide-react';
import { Card } from "@/components/ui/card";

type AgentType = {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  features: string[];
};

export const DynamicAgentDisplay = () => {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  
  const agents: AgentType[] = [
    {
      id: "sales",
      title: "Sales Agent",
      icon: <BriefcaseIcon className="h-6 w-6" />,
      color: "from-blue-500 to-indigo-600",
      description: "Boost sales and lead generation with AI assistance",
      features: [
        "Generate personalized outreach emails",
        "Qualify leads automatically",
        "Schedule follow-up reminders",
        "Analyze sales conversations"
      ]
    },
    {
      id: "recruiting",
      title: "Recruiting Agent",
      icon: <UserIcon className="h-6 w-6" />,
      color: "from-purple-500 to-pink-600",
      description: "Find and engage top talent efficiently",
      features: [
        "Search for candidates by skills",
        "Analyze LinkedIn profiles",
        "Generate interview questions",
        "Track candidate progress"
      ]
    },
    {
      id: "research",
      title: "Research Agent",
      icon: <SearchIcon className="h-6 w-6" />,
      color: "from-emerald-500 to-teal-600",
      description: "Deep research and competitive analysis",
      features: [
        "Analyze market trends",
        "Track competitor activities",
        "Generate industry reports",
        "Find strategic opportunities"
      ]
    }
  ];

  const handleAgentClick = (agentId: string) => {
    if (activeAgent === agentId) {
      setActiveAgent(null);
    } else {
      setActiveAgent(agentId);
    }
  };

  return (
    <div className="relative rounded-xl shadow-2xl overflow-hidden bg-gradient-to-tr from-gray-900 to-gray-800 hover:scale-[1.02] transition-transform duration-300 animate-fade-in p-6">
      <div className="relative z-20">
        {/* Header */}
        <div className="text-white text-center mb-6">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
            Intelligent AI Assistants
          </h3>
          <p className="text-gray-300 mt-2">Interact with our specialized AI agents</p>
        </div>
        
        {/* Agents Container */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              onClick={() => handleAgentClick(agent.id)}
              className={`relative cursor-pointer`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: agents.indexOf(agent) * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className={`flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br ${agent.color} hover:shadow-lg transition-all duration-300 w-28 h-28`}>
                <div className="text-white mb-2">
                  {agent.icon}
                </div>
                <span className="text-white text-sm font-medium text-center">
                  {agent.title}
                </span>
                
                {/* Sparkles Animation */}
                <motion.div 
                  className="absolute -inset-1 rounded-lg opacity-30 pointer-events-none"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }}
                >
                  <div className="absolute top-0 left-0 w-2 h-2 rounded-full bg-white"></div>
                  <div className="absolute top-1/4 right-0 w-1 h-1 rounded-full bg-white"></div>
                  <div className="absolute bottom-0 left-1/4 w-1.5 h-1.5 rounded-full bg-white"></div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Expanded Agent Details */}
        <AnimatePresence>
          {activeAgent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700 text-white p-4 rounded-lg">
                {agents.filter(agent => agent.id === activeAgent).map(agent => (
                  <div key={agent.id} className="space-y-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-md bg-gradient-to-r ${agent.color} mr-3`}>
                        {agent.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{agent.title}</h4>
                        <p className="text-gray-300 text-sm">{agent.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {agent.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-3 flex space-x-2">
                      <button className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm">
                        <MessageSquare className="h-4 w-4" />
                        Chat Now
                      </button>
                      <button className="flex items-center justify-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md text-sm">
                        <Link className="h-4 w-4" />
                        Learn More
                      </button>
                    </div>
                  </div>
                ))}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Usage Statistics */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-gray-800/60 rounded-lg p-3 text-center border border-gray-700">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-400" />
            <span className="text-gray-300 text-xs">10x Faster</span>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-3 text-center border border-gray-700">
            <Users className="h-5 w-5 mx-auto mb-1 text-purple-400" />
            <span className="text-gray-300 text-xs">2K+ Users</span>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-3 text-center border border-gray-700">
            <MessageSquare className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
            <span className="text-gray-300 text-xs">24/7 Support</span>
          </div>
        </div>
      </div>
      
      {/* Background effects */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-teal-500 rounded-full filter blur-3xl opacity-10"></div>
      </div>
    </div>
  );
};
