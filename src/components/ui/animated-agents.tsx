
import React, { useEffect, useState, useRef } from 'react';
import { Brain, Bot, Sparkles, Zap, GitBranch, Cpu } from 'lucide-react';

type Agent = {
  id: number;
  icon: React.ReactNode;
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  direction: { x: number; y: number };
};

export const AnimatedAgents = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const agentCount = 20;
  const animationRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const { clientWidth, clientHeight } = containerRef.current;
    const initialAgents: Agent[] = [];

    const icons = [
      <Brain />, 
      <Bot />, 
      <Sparkles />, 
      <Zap />, 
      <GitBranch />, 
      <Cpu />
    ];

    for (let i = 0; i < agentCount; i++) {
      initialAgents.push({
        id: i,
        icon: icons[Math.floor(Math.random() * icons.length)],
        x: Math.random() * clientWidth,
        y: Math.random() * clientHeight,
        speed: 0.5 + Math.random() * 1.5,
        size: 20 + Math.random() * 20,
        opacity: 0.3 + Math.random() * 0.7,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1,
        direction: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        }
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
          
          return {
            ...agent,
            x: newX,
            y: newY,
            rotation: (agent.rotation + agent.rotationSpeed) % 360,
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
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden"
    >
      {agents.map(agent => (
        <div
          key={agent.id}
          className="absolute transition-transform duration-100 ease-linear"
          style={{
            left: `${agent.x}px`,
            top: `${agent.y}px`,
            opacity: agent.opacity,
            transform: `rotate(${agent.rotation}deg)`,
            width: `${agent.size}px`,
            height: `${agent.size}px`,
            color: 'white'
          }}
        >
          {agent.icon}
        </div>
      ))}
    </div>
  );
};
