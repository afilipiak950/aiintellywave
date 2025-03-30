
import React, { useEffect, useState, useRef } from 'react';
import { Brain, Bot, Sparkles, Zap, GitBranch, Cpu, MoreHorizontal, Atom, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

type Agent = {
  id: number;
  icon: React.ReactNode;
  avatarUrl?: string;
  name?: string;
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  scaleSpeed: number;
  direction: { x: number; y: number };
  isPulsing: boolean;
  pulseColor: string;
  highlight: boolean;
  clickable: boolean;
};

interface AnimatedAgentsProps {
  interactive?: boolean;
  density?: 'low' | 'medium' | 'high';
  showAvatars?: boolean;
  pulseEffect?: boolean;
  clickEffects?: boolean;
  speed?: 'slow' | 'medium' | 'fast';
}

// Sample avatar URLs - replace with your actual avatar URLs
const sampleAvatars = [
  'https://i.pravatar.cc/150?img=1',
  'https://i.pravatar.cc/150?img=2',
  'https://i.pravatar.cc/150?img=3',
  'https://i.pravatar.cc/150?img=4',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=6',
  'https://i.pravatar.cc/150?img=7',
];

const sampleNames = [
  'Atlas AI',
  'Nova',
  'Cortex',
  'Echo',
  'Quantum',
  'Nexus',
  'Pixel',
  'Vector',
  'Synapse',
  'Matrix',
  'Cipher',
];

export const AnimatedAgents: React.FC<AnimatedAgentsProps> = ({
  interactive = true,
  density = 'medium',
  showAvatars = true,
  pulseEffect = true,
  clickEffects = true,
  speed = 'medium'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [clickPosition, setClickPosition] = useState<{ x: number, y: number, active: boolean }>({ x: 0, y: 0, active: false });
  const animationRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);
  
  // Determine agent count based on density
  const getAgentCount = () => {
    switch(density) {
      case 'low': return 12;
      case 'high': return 35;
      case 'medium':
      default: return 20;
    }
  };
  
  // Determine speed multiplier
  const getSpeedMultiplier = () => {
    switch(speed) {
      case 'slow': return 0.7;
      case 'fast': return 2;
      case 'medium':
      default: return 1;
    }
  };

  // Handle click event
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !clickEffects) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setClickPosition({ x, y, active: true });
    
    // Attract agents to click position
    setAgents(prevAgents => 
      prevAgents.map(agent => ({
        ...agent,
        direction: {
          x: (x - agent.x) / 100,
          y: (y - agent.y) / 100
        },
        speed: agent.speed * 3,
        highlight: true
      }))
    );
    
    // Reset after animation
    setTimeout(() => {
      setClickPosition({ x: 0, y: 0, active: false });
      setAgents(prevAgents => 
        prevAgents.map(agent => ({
          ...agent,
          highlight: false,
          direction: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
          },
          speed: (0.5 + Math.random() * 1.5) * getSpeedMultiplier()
        }))
      );
    }, 1500);
  };
  
  // Handle hover on agent
  const handleAgentHover = (id: number) => {
    if (!interactive) return;
    
    setAgents(prevAgents => 
      prevAgents.map(agent => ({
        ...agent,
        scale: agent.id === id ? 1.5 : agent.scale,
        isPulsing: agent.id === id ? true : agent.isPulsing
      }))
    );
  };
  
  // Handle click on agent
  const handleAgentClick = (id: number, e: React.MouseEvent) => {
    if (!interactive || !clickEffects) return;
    e.stopPropagation();
    
    // Create explosion effect from this agent
    setAgents(prevAgents => {
      const clickedAgent = prevAgents.find(agent => agent.id === id);
      if (!clickedAgent) return prevAgents;
      
      return prevAgents.map(agent => ({
        ...agent,
        direction: {
          x: (agent.x - clickedAgent.x) / 50,
          y: (agent.y - clickedAgent.y) / 50
        },
        speed: agent.speed * 4,
        rotation: agent.rotation + 180,
        rotationSpeed: agent.rotationSpeed * 3,
        highlight: true
      }));
    });
    
    // Reset after animation
    setTimeout(() => {
      setAgents(prevAgents => 
        prevAgents.map(agent => ({
          ...agent,
          highlight: false,
          direction: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
          },
          speed: (0.5 + Math.random() * 1.5) * getSpeedMultiplier(),
          rotationSpeed: (Math.random() - 0.5) * 1
        }))
      );
    }, 2000);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const { clientWidth, clientHeight } = containerRef.current;
    const initialAgents: Agent[] = [];
    const speedMultiplier = getSpeedMultiplier();
    const agentCount = getAgentCount();

    const icons = [
      <Brain />, 
      <Bot />, 
      <Sparkles />, 
      <Zap />, 
      <GitBranch />, 
      <Cpu />,
      <Atom />,
      <Star />,
      <MoreHorizontal />
    ];
    
    const pulseColors = [
      'rgba(59, 130, 246, 0.5)', // blue
      'rgba(139, 92, 246, 0.5)', // purple
      'rgba(236, 72, 153, 0.5)', // pink
      'rgba(16, 185, 129, 0.5)', // green
      'rgba(245, 158, 11, 0.5)', // amber
    ];

    for (let i = 0; i < agentCount; i++) {
      initialAgents.push({
        id: i,
        icon: icons[Math.floor(Math.random() * icons.length)],
        avatarUrl: showAvatars ? sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)] : undefined,
        name: sampleNames[Math.floor(Math.random() * sampleNames.length)],
        x: Math.random() * clientWidth,
        y: Math.random() * clientHeight,
        speed: (0.5 + Math.random() * 1.5) * speedMultiplier,
        size: 20 + Math.random() * 20,
        opacity: 0.3 + Math.random() * 0.7,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1,
        scale: 1,
        scaleSpeed: 0.01 + Math.random() * 0.02,
        direction: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        },
        isPulsing: pulseEffect && Math.random() > 0.7,
        pulseColor: pulseColors[Math.floor(Math.random() * pulseColors.length)],
        highlight: false,
        clickable: interactive && Math.random() > 0.5
      });
    }

    setAgents(initialAgents);

    const animate = (timestamp: number) => {
      if (!containerRef.current) return;
      
      // Limit updates to improve performance
      if (timestamp - lastUpdateTime.current < 16) { // ~60fps
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastUpdateTime.current = timestamp;
      
      const { clientWidth, clientHeight } = containerRef.current;
      
      setAgents(prevAgents => 
        prevAgents.map(agent => {
          // Update position based on direction and speed
          let newX = agent.x + agent.direction.x * agent.speed;
          let newY = agent.y + agent.direction.y * agent.speed;
          
          // Bounce off edges
          let newDirectionX = agent.direction.x;
          let newDirectionY = agent.direction.y;
          
          if (newX < 0 || newX > clientWidth) {
            newDirectionX *= -1;
            newX = Math.max(0, Math.min(newX, clientWidth));
          }
          
          if (newY < 0 || newY > clientHeight) {
            newDirectionY *= -1;
            newY = Math.max(0, Math.min(newY, clientHeight));
          }
          
          // Pulsing scale effect
          let newScale = agent.scale;
          if (agent.isPulsing) {
            newScale = agent.scale + Math.sin(timestamp * 0.003) * agent.scaleSpeed;
          }
          
          return {
            ...agent,
            x: newX,
            y: newY,
            rotation: (agent.rotation + agent.rotationSpeed) % 360,
            scale: newScale,
            direction: {
              x: newDirectionX,
              y: newDirectionY
            }
          };
        })
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [density, interactive, pulseEffect, showAvatars, speed]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {agents.map(agent => (
        <motion.div
          key={agent.id}
          className={`absolute transition-all ${
            agent.clickable ? 'cursor-pointer hover:z-10' : ''
          } ${
            agent.highlight ? 'z-10' : ''
          }`}
          style={{
            left: `${agent.x}px`,
            top: `${agent.y}px`,
            opacity: agent.opacity,
            width: `${agent.size}px`,
            height: `${agent.size}px`,
            color: agent.highlight ? 'rgb(79, 70, 229)' : 'white',
            filter: agent.highlight ? 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.8))' : 'none'
          }}
          animate={{
            rotate: agent.rotation,
            scale: agent.scale
          }}
          transition={{ duration: 0.2 }}
          onMouseEnter={() => handleAgentHover(agent.id)}
          onMouseLeave={() => {
            if (interactive) {
              setAgents(prevAgents => 
                prevAgents.map(a => 
                  a.id === agent.id 
                    ? {...a, scale: 1, isPulsing: Math.random() > 0.7} 
                    : a
                )
              );
            }
          }}
          onClick={(e) => handleAgentClick(agent.id, e)}
        >
          {agent.isPulsing && pulseEffect && (
            <motion.div 
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: agent.pulseColor,
                zIndex: -1
              }}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.7, 0.2, 0.7]
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity
              }}
            />
          )}
          
          {showAvatars && agent.avatarUrl ? (
            <div className="relative h-full w-full">
              <Avatar className="h-full w-full">
                <AvatarImage src={agent.avatarUrl} />
                <AvatarFallback>{agent.name?.substring(0, 2)}</AvatarFallback>
              </Avatar>
              {agent.clickable && interactive && (
                <motion.div
                  className="absolute -top-1 -right-1 bg-primary rounded-full text-white flex items-center justify-center text-[9px] font-bold"
                  style={{
                    width: '12px',
                    height: '12px'
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >+</motion.div>
              )}
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              {agent.icon}
            </div>
          )}
          
          {clickEffects && agent.highlight && (
            <motion.div 
              className="absolute inset-0 rounded-full bg-primary"
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1 }}
            />
          )}
        </motion.div>
      ))}
      
      <AnimatePresence>
        {clickPosition.active && clickEffects && (
          <motion.div 
            className="absolute bg-indigo-500 rounded-full"
            style={{ 
              left: clickPosition.x - 50, 
              top: clickPosition.y - 50,
              width: 100,
              height: 100
            }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
