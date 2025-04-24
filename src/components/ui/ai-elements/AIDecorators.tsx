
import React from 'react';
import { cn } from "@/utils/cn";

interface AIDecoratorProps {
  className?: string;
  type?: 'circuit' | 'grid' | 'pulse' | 'nodes' | 'waves';
}

export const AIDecorator: React.FC<AIDecoratorProps> = ({ 
  className,
  type = 'circuit'
}) => {
  return (
    <div className={cn("absolute pointer-events-none opacity-10", className)}>
      {type === 'circuit' && (
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20,20 L80,20 L80,80 L140,80 L140,140 L80,140 L80,180 L180,180" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
          <circle cx="20" cy="20" r="5" fill="currentColor" />
          <circle cx="80" cy="20" r="5" fill="currentColor" />
          <circle cx="80" cy="80" r="5" fill="currentColor" />
          <circle cx="140" cy="80" r="5" fill="currentColor" />
          <circle cx="140" cy="140" r="5" fill="currentColor" />
          <circle cx="80" cy="140" r="5" fill="currentColor" />
          <circle cx="80" cy="180" r="5" fill="currentColor" />
          <circle cx="180" cy="180" r="5" fill="currentColor" />
        </svg>
      )}
      
      {type === 'grid' && (
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10,10 L190,10 L190,190 L10,190 Z" stroke="currentColor" strokeWidth="1" />
          <path d="M10,40 L190,40" stroke="currentColor" strokeWidth="0.5" />
          <path d="M10,70 L190,70" stroke="currentColor" strokeWidth="0.5" />
          <path d="M10,100 L190,100" stroke="currentColor" strokeWidth="0.5" />
          <path d="M10,130 L190,130" stroke="currentColor" strokeWidth="0.5" />
          <path d="M10,160 L190,160" stroke="currentColor" strokeWidth="0.5" />
          <path d="M40,10 L40,190" stroke="currentColor" strokeWidth="0.5" />
          <path d="M70,10 L70,190" stroke="currentColor" strokeWidth="0.5" />
          <path d="M100,10 L100,190" stroke="currentColor" strokeWidth="0.5" />
          <path d="M130,10 L130,190" stroke="currentColor" strokeWidth="0.5" />
          <path d="M160,10 L160,190" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      )}
      
      {type === 'pulse' && (
        <div className="relative w-[200px] h-[200px]">
          <div className="absolute inset-0 rounded-full border-4 border-primary opacity-20 animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-8 rounded-full border-2 border-primary opacity-40 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
          <div className="absolute inset-16 rounded-full border border-primary opacity-60 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
        </div>
      )}
      
      {type === 'nodes' && (
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="8" fill="currentColor" />
          <circle cx="150" cy="50" r="8" fill="currentColor" />
          <circle cx="50" cy="150" r="8" fill="currentColor" />
          <circle cx="150" cy="150" r="8" fill="currentColor" />
          <circle cx="100" cy="100" r="10" fill="currentColor" />
          <line x1="50" y1="50" x2="100" y2="100" stroke="currentColor" strokeWidth="2" />
          <line x1="150" y1="50" x2="100" y2="100" stroke="currentColor" strokeWidth="2" />
          <line x1="50" y1="150" x2="100" y2="100" stroke="currentColor" strokeWidth="2" />
          <line x1="150" y1="150" x2="100" y2="100" stroke="currentColor" strokeWidth="2" />
        </svg>
      )}
      
      {type === 'waves' && (
        <svg width="200" height="100" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,50 Q25,20 50,50 T100,50 T150,50 T200,50" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
          <path d="M0,50 Q25,80 50,50 T100,50 T150,50 T200,50" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
          <path d="M-50,50 Q-25,20 0,50 T50,50 T100,50 T150,50" stroke="currentColor" strokeWidth="1.5" opacity="0.5" style={{ animation: 'slide-right 15s linear infinite' }} />
          <path d="M-50,50 Q-25,80 0,50 T50,50 T100,50 T150,50" stroke="currentColor" strokeWidth="1.5" opacity="0.5" style={{ animation: 'slide-right 15s linear infinite' }} />
        </svg>
      )}
    </div>
  );
};

// Component that combines multiple decorators for rich backgrounds
export const AIDecorativeBanner: React.FC<{className?: string}> = ({ className }) => {
  return (
    <div className={cn("relative w-full h-64 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg overflow-hidden", className)}>
      <AIDecorator type="circuit" className="top-5 left-5 text-blue-400" />
      <AIDecorator type="nodes" className="bottom-5 right-5 text-indigo-400" />
      <AIDecorator type="grid" className="top-10 right-20 text-purple-300" />
      <AIDecorator type="waves" className="bottom-0 left-10 text-cyan-400" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent dark:from-transparent dark:via-black/10 dark:to-transparent"></div>
      
      <div className="relative z-10 flex items-center justify-center h-full">
        <slot />
      </div>
    </div>
  );
};

// AI-themed card component with decorative elements
export const AICard: React.FC<{
  className?: string;
  children: React.ReactNode;
  decorationType?: 'circuit' | 'grid' | 'pulse' | 'nodes' | 'waves';
}> = ({ className, children, decorationType = 'circuit' }) => {
  return (
    <div className={cn(
      "relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="relative z-10 p-5">
        {children}
      </div>
      <AIDecorator type={decorationType} className="absolute top-0 right-0 text-slate-200 dark:text-slate-700" />
    </div>
  );
};
