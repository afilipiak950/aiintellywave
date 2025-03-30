
import { Check, Loader2 } from 'lucide-react';
import { Button } from '../../button';
import { motion } from 'framer-motion';

interface ApproveButtonProps {
  isApproved: boolean;
  onApprove: (e: React.MouseEvent) => void;
  isLoading?: boolean;
}

const ApproveButton = ({ isApproved, onApprove, isLoading = false }: ApproveButtonProps) => {
  return (
    <motion.div
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
    >
      <Button
        size="sm"
        variant={isApproved ? "default" : "outline"}
        className={`h-8 px-2 transition-all duration-300 ${
          isApproved 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-white hover:bg-green-50 border-green-200 hover:border-green-300 text-green-700'
        }`}
        onClick={onApprove}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Check size={16} className={isApproved ? 'text-white' : ''} />
        )}
        <span className="ml-1 text-xs">
          {isApproved ? 'Approved' : 'Approve'}
        </span>
      </Button>
    </motion.div>
  );
};

export default ApproveButton;
