
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, Bot, Sparkles, Zap, GitBranch, Cpu, MessageSquare, 
  Users, TrendingUp, Link, BriefcaseIcon, UserIcon, SearchIcon 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AIAgentsDashboard = () => {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  
  // Zufällige Partikelgenerator 
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    color: string;
    direction: { x: number; y: number };
    speed: number;
  }>>([]);

  useEffect(() => {
    // Partikel nach kurzer Verzögerung anzeigen
    const timer = setTimeout(() => setShowParticles(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showParticles) return;

    // Generiere 50 zufällige Partikel
    const initialParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.4,
      color: Math.random() > 0.5 ? '#3b82f6' : '#60a5fa',
      direction: { 
        x: (Math.random() - 0.5) * 2, 
        y: (Math.random() - 0.5) * 2 
      },
      speed: 0.05 + Math.random() * 0.1
    }));
    
    setParticles(initialParticles);

    const updateParticles = () => {
      setParticles(prev => prev.map(particle => {
        // Bewege Partikel
        let newX = particle.x + particle.direction.x * particle.speed;
        let newY = particle.y + particle.direction.y * particle.speed;
        
        // Prüfe, ob Partikel den Rand erreicht hat
        let newDirectionX = particle.direction.x;
        let newDirectionY = particle.direction.y;
        
        if (newX <= 0 || newX >= 100) {
          newDirectionX *= -1;
          newX = Math.max(0, Math.min(newX, 100));
        }
        
        if (newY <= 0 || newY >= 100) {
          newDirectionY *= -1;
          newY = Math.max(0, Math.min(newY, 100));
        }
        
        return {
          ...particle,
          x: newX,
          y: newY,
          direction: { x: newDirectionX, y: newDirectionY }
        };
      }));
    };

    const intervalId = setInterval(updateParticles, 50);
    return () => clearInterval(intervalId);
  }, [showParticles]);

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

  // Bewegende KI-Bot-Symbole
  const bots = [
    { icon: <Brain className="h-full w-full" />, animationDelay: 0 },
    { icon: <Bot className="h-full w-full" />, animationDelay: 2 },
    { icon: <Sparkles className="h-full w-full" />, animationDelay: 4 },
    { icon: <Zap className="h-full w-full" />, animationDelay: 1 },
    { icon: <GitBranch className="h-full w-full" />, animationDelay: 3 },
    { icon: <Cpu className="h-full w-full" />, animationDelay: 5 }
  ];

  return (
    <div className="w-full relative rounded-xl shadow-xl overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      {/* Dynamischer Hintergrund mit Partikeln */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(particle => (
          <div 
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              transition: 'all 0.5s linear'
            }}
          />
        ))}
        
        {/* Bewegende KI Bots */}
        {bots.map((bot, index) => (
          <motion.div
            key={index}
            className="absolute text-blue-400 dark:text-blue-300 opacity-30"
            initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%', scale: 0.5 + Math.random() * 0.5 }}
            animate={{ 
              x: [
                `${20 + Math.random() * 60}%`, 
                `${20 + Math.random() * 60}%`,
                `${20 + Math.random() * 60}%`
              ],
              y: [
                `${20 + Math.random() * 60}%`, 
                `${20 + Math.random() * 60}%`,
                `${20 + Math.random() * 60}%`
              ],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              delay: bot.animationDelay,
              ease: "linear"
            }}
            style={{ 
              width: `${30 + Math.random() * 20}px`, 
              height: `${30 + Math.random() * 20}px` 
            }}
          >
            {bot.icon}
          </motion.div>
        ))}
      </div>
      
      {/* Hauptinhalt */}
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
                animate={{
                  boxShadow: activeAgent === agent.id 
                    ? [
                        "0 10px 15px -3px rgba(59, 130, 246, 0.5), 0 4px 6px -2px rgba(59, 130, 246, 0.3)",
                        "0 20px 25px -5px rgba(59, 130, 246, 0.6), 0 10px 10px -5px rgba(59, 130, 246, 0.4)",
                        "0 10px 15px -3px rgba(59, 130, 246, 0.5), 0 4px 6px -2px rgba(59, 130, 246, 0.3)"
                      ]
                    : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                }}
                transition={{
                  repeat: activeAgent === agent.id ? Infinity : 0,
                  duration: 1.5
                }}
              >
                <div className="text-white mb-4 bg-white/20 p-3 rounded-full">
                  {agent.icon}
                </div>
                <span className="text-white text-lg font-medium text-center">
                  {agent.title}
                </span>
                
                {/* Glowing effect */}
                <motion.div 
                  className="absolute inset-0 rounded-lg opacity-0 bg-white"
                  animate={{ 
                    opacity: [0, 0.2, 0],
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                    delay: index * 0.7
                  }}
                />
                
                {/* Floating particles around active agent */}
                {activeAgent === agent.id && (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full"
                        initial={{ 
                          x: 0, 
                          y: 0, 
                          opacity: 0.7 
                        }}
                        animate={{ 
                          x: [0, (i % 2 ? -20 : 20) * (1 + i % 3)], 
                          y: [0, -30 * (1 + i % 2)],
                          opacity: [0.7, 0]
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1 + (i * 0.5), 
                          ease: "easeOut",
                          repeatDelay: i * 0.2
                        }}
                      />
                    ))}
                  </>
                )}
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
        
        {/* Statistiken */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <TooltipProvider>
            {[
              { icon: <TrendingUp />, text: "10x schneller", color: "bg-blue-500" },
              { icon: <Users />, text: "2K+ Nutzer", color: "bg-indigo-500" },
              { icon: <MessageSquare />, text: "24/7 Support", color: "bg-sky-500" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-md border border-blue-100 dark:border-blue-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (index * 0.1) }}
                whileHover={{ y: -5, boxShadow: "0 12px 20px -10px rgba(59, 130, 246, 0.3)" }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`p-2 rounded-full ${stat.color} text-white`}>
                        {stat.icon}
                      </div>
                      <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">{stat.text}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Statistiken basierend auf Kundenfeedback</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </TooltipProvider>
        </div>
        
        {/* Pulsierender blauer Kreis im Hintergrund */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
          <motion.div 
            className="rounded-full bg-blue-500/5"
            initial={{ width: 0, height: 0 }}
            animate={{ 
              width: ['0vh', '100vh', '0vh'],
              height: ['0vh', '100vh', '0vh'],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 10,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AIAgentsDashboard;
