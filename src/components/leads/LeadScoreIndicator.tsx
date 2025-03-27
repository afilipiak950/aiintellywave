
import { motion } from 'framer-motion';

interface LeadScoreIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const LeadScoreIndicator = ({ score, size = 'md' }: LeadScoreIndicatorProps) => {
  // Normalize score to a 0-100 range if needed
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Determine color based on score
  const getColor = () => {
    if (normalizedScore >= 80) return 'bg-emerald-500';
    if (normalizedScore >= 60) return 'bg-lime-500';
    if (normalizedScore >= 40) return 'bg-amber-500';
    if (normalizedScore >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Determine size
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8 text-xs';
      case 'lg': return 'w-16 h-16 text-lg';
      default: return 'w-12 h-12 text-sm';
    }
  };
  
  return (
    <motion.div 
      className={`relative ${getSizeClasses()} rounded-full flex items-center justify-center font-medium text-white`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {/* Background circle */}
      <div className="absolute inset-0 rounded-full bg-gray-200" />
      
      {/* Score circle with animated fill */}
      <motion.div 
        className={`absolute inset-0 rounded-full ${getColor()}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          clipPath: `circle(${normalizedScore}% at center)`
        }}
      />
      
      {/* Score text */}
      <span className="relative z-10 font-semibold">{normalizedScore}</span>
    </motion.div>
  );
};

export default LeadScoreIndicator;
