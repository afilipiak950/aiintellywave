
import { Button } from "../../button";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface ApproveButtonProps {
  isApproved: boolean;
  onApprove: (e: React.MouseEvent) => void;
  isLoading?: boolean;
}

const ApproveButton = ({ isApproved, onApprove, isLoading = false }: ApproveButtonProps) => {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant={isApproved ? "default" : "outline"}
        size="sm"
        onClick={onApprove}
        disabled={isLoading}
        className={`rounded-full p-0 w-8 h-8 transition-all duration-300 ${
          isApproved 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
        }`}
      >
        {isLoading ? (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
          />
        ) : isApproved ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Check className="h-3 w-3 text-white" />
          </motion.div>
        ) : (
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <X className="h-3 w-3 text-gray-400" />
          </motion.div>
        )}
      </Button>
    </motion.div>
  );
};

export default ApproveButton;
