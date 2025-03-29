
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface LeadDetailFooterProps {
  onClose: () => void;
  onConvert: () => void;
}

const LeadDetailFooter = ({ onClose, onConvert }: LeadDetailFooterProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="p-4 border-t flex justify-end space-x-2"
    >
      <Button variant="outline" onClick={onClose}>Close</Button>
      <Button 
        className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300"
        onClick={onConvert}
      >
        Convert to Candidate
      </Button>
    </motion.div>
  );
};

export default LeadDetailFooter;
