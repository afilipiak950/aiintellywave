
import React from 'react';
import { Brain, Cpu, Network, Sparkles, Bot, Zap } from 'lucide-react';
import { cn } from "@/utils/cn";

interface AIThemeElementsProps {
  className?: string;
  variant?: 'default' | 'sparse' | 'dense';
}

export const AIThemeElements: React.FC<AIThemeElementsProps> = ({ 
  className,
  variant = 'default'
}) => {
  // Different densities based on variant
  const elements = {
    sparse: 5,
    default: 8,
    dense: 12
  };
  
  const count = elements[variant];
  const positions = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push({
        top: `${10 + Math.random() * 80}%`,
        left: `${10 + Math.random() * 80}%`,
        icon: i % 6,
        size: 16 + Math.floor(Math.random() * 8),
        delay: Math.random() * 10,
        duration: 30 + Math.random() * 20
      });
    }
    return items;
  }, [count]);

  const icons = [Brain, Cpu, Network, Sparkles, Bot, Zap];

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {positions.map((item, index) => {
        const Icon = icons[item.icon];
        return (
          <div 
            key={index}
            className="absolute opacity-20 text-primary"
            style={{ 
              top: item.top, 
              left: item.left,
              animation: `ai-float ${item.duration}s ease-in-out infinite ${item.delay}s`
            }}
          >
            <Icon size={item.size} strokeWidth={1.5} />
          </div>
        );
      })}
    </div>
  );
};
