
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, Link, BriefcaseIcon, UserIcon, SearchIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIAgentsDashboard = () => {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  
  // KI-Agenten Daten
  const agents = [
    {
      id: "sales",
      title: "Vertriebsagent",
      icon: <BriefcaseIcon className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
      description: "Steigern Sie Verkäufe und Lead-Generierung mit KI-Unterstützung",
      features: [
        "Personalisierte Outreach-E-Mails generieren",
        "Leads automatisch qualifizieren",
        "Follow-up-Erinnerungen planen",
        "Verkaufsgespräche analysieren"
      ]
    },
    {
      id: "recruiting",
      title: "Recruiting-Agent",
      icon: <UserIcon className="h-6 w-6" />,
      color: "from-indigo-500 to-indigo-600",
      description: "Finden und engagieren Sie effizient Spitzentalente",
      features: [
        "Suche nach Kandidaten nach Fähigkeiten",
        "LinkedIn-Profile analysieren",
        "Interviewfragen generieren",
        "Kandidatenfortschritt verfolgen"
      ]
    },
    {
      id: "research",
      title: "Recherche-Agent",
      icon: <SearchIcon className="h-6 w-6" />,
      color: "from-sky-500 to-sky-600",
      description: "Tiefgehende Recherche und Wettbewerbsanalyse",
      features: [
        "Markttrends analysieren",
        "Wettbewerberaktivitäten verfolgen",
        "Branchenberichte generieren",
        "Strategische Chancen finden"
      ]
    }
  ];

  return (
    <div className="w-full rounded-xl shadow-xl overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
            Intelligente KI-Assistenten
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Interagieren Sie mit unseren spezialisierten KI-Agenten für maximale Produktivität
          </p>
        </motion.div>
        
        {/* Agenten-Karten */}
        <div className="flex flex-wrap justify-center gap-5 mb-8">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              onClick={() => setActiveAgent(activeAgent === agent.id ? null : agent.id)}
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
          ))}
        </div>
        
        {/* Agent Details */}
        <AnimatePresence>
          {activeAgent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-blue-200 dark:border-blue-800 text-gray-800 dark:text-white p-6 rounded-lg mb-6 shadow-lg">
                {agents.filter(agent => agent.id === activeAgent).map(agent => (
                  <div key={agent.id} className="space-y-4">
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
                ))}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIAgentsDashboard;
