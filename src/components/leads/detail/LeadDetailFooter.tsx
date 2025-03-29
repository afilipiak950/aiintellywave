
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LeadDetailFooterProps {
  onClose: () => void;
  onConvert: () => void;
  isConverting?: boolean;
}

const LeadDetailFooter = ({ onClose, onConvert, isConverting = false }: LeadDetailFooterProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="p-4 border-t flex justify-end space-x-2"
    >
      <Button variant="outline" onClick={onClose} disabled={isConverting}>Close</Button>
      <Button 
        className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300"
        onClick={onConvert}
        disabled={isConverting}
      >
        {isConverting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Converting...
          </>
        ) : (
          'Convert to Candidate'
        )}
      </Button>
    </motion.div>
  );
};

export default LeadDetailFooter;
