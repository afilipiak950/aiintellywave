
import React from 'react';
import { cn } from "@/utils/cn";
import { AIThemeElements } from './AIThemeElements';

interface AIDecoratorProps {
  type: 'nodes' | 'circuit' | 'wave' | 'grid';
  className?: string;
}

export const AIDecorator: React.FC<AIDecoratorProps> = ({ type, className }) => {
  return (
    <div className={cn("absolute pointer-events-none", className)}>
      {type === 'nodes' && (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="4" fill="currentColor" />
          <circle cx="100" cy="60" r="3" fill="currentColor" />
          <circle cx="20" cy="60" r="3" fill="currentColor" />
          <circle cx="60" cy="20" r="3" fill="currentColor" />
          <circle cx="60" cy="100" r="3" fill="currentColor" />
          <circle cx="84" cy="36" r="2" fill="currentColor" />
          <circle cx="36" cy="84" r="2" fill="currentColor" />
          <circle cx="84" cy="84" r="2" fill="currentColor" />
          <circle cx="36" cy="36" r="2" fill="currentColor" />
          <line x1="60" y1="24" x2="60" y2="56" stroke="currentColor" strokeWidth="1" />
          <line x1="60" y1="64" x2="60" y2="96" stroke="currentColor" strokeWidth="1" />
          <line x1="96" y1="60" x2="64" y2="60" stroke="currentColor" strokeWidth="1" />
          <line x1="56" y1="60" x2="24" y2="60" stroke="currentColor" strokeWidth="1" />
          <line x1="82" y1="38" x2="62" y2="58" stroke="currentColor" strokeWidth="1" />
          <line x1="38" y1="82" x2="58" y2="62" stroke="currentColor" strokeWidth="1" />
          <line x1="82" y1="82" x2="62" y2="62" stroke="currentColor" strokeWidth="1" />
          <line x1="38" y1="38" x2="58" y2="58" stroke="currentColor" strokeWidth="1" />
        </svg>
      )}
      
      {type === 'circuit' && (
        <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M75 30V120" stroke="currentColor" strokeWidth="1" />
          <path d="M30 75H120" stroke="currentColor" strokeWidth="1" />
          <path d="M45 45L105 105" stroke="currentColor" strokeWidth="1" />
          <path d="M45 105L105 45" stroke="currentColor" strokeWidth="1" />
          <circle cx="75" cy="75" r="5" fill="currentColor" />
          <circle cx="75" cy="30" r="3" fill="currentColor" />
          <circle cx="75" cy="120" r="3" fill="currentColor" />
          <circle cx="30" cy="75" r="3" fill="currentColor" />
          <circle cx="120" cy="75" r="3" fill="currentColor" />
          <circle cx="45" cy="45" r="3" fill="currentColor" />
          <circle cx="105" cy="105" r="3" fill="currentColor" />
          <circle cx="45" cy="105" r="3" fill="currentColor" />
          <circle cx="105" cy="45" r="3" fill="currentColor" />
        </svg>
      )}
      
      {type === 'wave' && (
        <svg width="200" height="50" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 25C20 5 30 45 50 25C70 5 80 45 100 25C120 5 130 45 150 25C170 5 180 45 200 25" stroke="currentColor" strokeWidth="1" />
        </svg>
      )}
      
      {type === 'grid' && (
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 20H100" stroke="currentColor" strokeWidth="0.5" />
          <path d="M0 40H100" stroke="currentColor" strokeWidth="0.5" />
          <path d="M0 60H100" stroke="currentColor" strokeWidth="0.5" />
          <path d="M0 80H100" stroke="currentColor" strokeWidth="0.5" />
          <path d="M20 0V100" stroke="currentColor" strokeWidth="0.5" />
          <path d="M40 0V100" stroke="currentColor" strokeWidth="0.5" />
          <path d="M60 0V100" stroke="currentColor" strokeWidth="0.5" />
          <path d="M80 0V100" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      )}
    </div>
  );
};

interface AIDecorativeBannerProps {
  children: React.ReactNode;
  className?: string;
}

export const AIDecorativeBanner: React.FC<AIDecorativeBannerProps> = ({ children, className }) => {
  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6", className)}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <AIThemeElements variant="sparse" className="opacity-30" />
        <AIDecorator type="circuit" className="top-10 right-10 text-blue-400 opacity-20" />
        <AIDecorator type="nodes" className="bottom-5 left-5 text-indigo-400 opacity-20" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-200 dark:bg-blue-700 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-200 dark:bg-indigo-700 rounded-full filter blur-3xl opacity-20"></div>
      </div>
      
      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
