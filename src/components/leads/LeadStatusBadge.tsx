
import { LeadStatus } from '@/types/lead';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const statusConfig: Record<LeadStatus, { color: string; label: string }> = {
  new: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'New' },
  contacted: { color: 'bg-purple-100 text-purple-800 border-purple-300', label: 'Contacted' },
  qualified: { color: 'bg-cyan-100 text-cyan-800 border-cyan-300', label: 'Qualified' },
  proposal: { color: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Proposal' },
  negotiation: { color: 'bg-pink-100 text-pink-800 border-pink-300', label: 'Negotiation' },
  won: { color: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Won' },
  lost: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Lost' }
};

interface LeadStatusBadgeProps {
  status: LeadStatus;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg'; // Add the size prop
}

export const LeadStatusBadge = ({ status, animate = false, size = 'md' }: LeadStatusBadgeProps) => {
  const { color, label } = statusConfig[status] || statusConfig.new;
  
  // Define size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1'
  };
  
  const badgeClass = `${color} border ${sizeClasses[size]}`;
  
  return animate ? (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <Badge variant="outline" className={badgeClass}>
        {label}
      </Badge>
    </motion.div>
  ) : (
    <Badge variant="outline" className={badgeClass}>
      {label}
    </Badge>
  );
};

export default LeadStatusBadge;
