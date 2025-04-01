
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Euro, TrendingUp, CalendarCheck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  icon?: 'money' | 'trend' | 'calendar' | 'users';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  format?: 'number' | 'currency' | 'percent';
  isLoading?: boolean;
}

const KpiCardRevenue = ({
  title,
  value,
  previousValue,
  change,
  icon = 'trend',
  variant = 'default',
  format = 'number',
  isLoading = false
}: KpiCardProps) => {
  const [animate, setAnimate] = useState(false);
  const [displayedValue, setDisplayedValue] = useState(value);
  
  // Format value based on type
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch(format) {
      case 'currency':
        return new Intl.NumberFormat('de-DE', { 
          style: 'currency', 
          currency: 'EUR',
          maximumFractionDigits: 0
        }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('de-DE');
    }
  };
  
  // Animate when value changes
  useEffect(() => {
    if (value !== displayedValue) {
      setDisplayedValue(value);
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [value, displayedValue]);
  
  const variantClasses = {
    default: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
    primary: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    success: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    warning: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200',
    info: 'bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200'
  };
  
  const iconComponent = {
    money: <Euro className="h-6 w-6" />,
    trend: <TrendingUp className="h-6 w-6" />,
    calendar: <CalendarCheck className="h-6 w-6" />,
    users: <Users className="h-6 w-6" />
  };
  
  return (
    <motion.div
      className={cn(
        "relative rounded-xl border p-6 shadow hover:shadow-md transition-all", 
        variantClasses[variant],
        "transform hover:scale-[1.01] transition-transform duration-200"
      )}
      whileHover={{ y: -4 }}
      whileTap={{ y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {animate && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div 
                  key={i}
                  className={cn(
                    "absolute rounded-full opacity-60",
                    i % 3 === 0 ? "bg-blue-400" : i % 3 === 1 ? "bg-green-400" : "bg-amber-400",
                    "h-2 w-2"
                  )}
                  initial={{ 
                    x: '50%', 
                    y: '100%',
                    opacity: 0.8 
                  }}
                  animate={{ 
                    x: `${50 + (Math.random() * 60 - 30)}%`, 
                    y: `${-20 + (Math.random() * -80)}%`,
                    opacity: 0 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 + Math.random(), ease: 'easeOut' }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
          <AnimatePresence mode="wait">
            <motion.div
              key={`value-${displayedValue}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold"
            >
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                formatValue(value)
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className={cn(
          "rounded-full p-3 bg-white bg-opacity-60",
          {
            'text-blue-500': variant === 'primary',
            'text-green-500': variant === 'success',
            'text-amber-500': variant === 'warning',
            'text-violet-500': variant === 'info',
            'text-gray-500': variant === 'default',
          }
        )}>
          {iconComponent[icon]}
        </div>
      </div>
      
      {!isLoading && change !== undefined && (
        <div className="mt-2 flex items-center">
          <motion.div
            animate={animate ? { rotate: [0, -10, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
            className={cn(
              "mr-1.5",
              change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-500"
            )}
          >
            {change > 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : change < 0 ? (
              <TrendingUp className="h-4 w-4 transform rotate-180" />
            ) : null}
          </motion.div>
          
          <span className={cn(
            "text-xs font-medium",
            change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-500"
          )}>
            {Math.abs(change).toFixed(1)}% vs. previous
          </span>
        </div>
      )}
      
      {previousValue && (
        <div className="mt-1 text-xs text-muted-foreground">
          Previous: {formatValue(previousValue)}
        </div>
      )}
    </motion.div>
  );
};

export default KpiCardRevenue;
