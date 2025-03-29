
import { Lead } from '@/types/lead';
import { motion } from "framer-motion";
import { Linkedin, X } from 'lucide-react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LeadDetailHeaderProps {
  lead: Lead | null;
  getLinkedInUrl: () => string | null;
}

const LeadDetailHeader = ({ lead, getLinkedInUrl }: LeadDetailHeaderProps) => {
  if (!lead) return null;
  
  const linkedInUrl = getLinkedInUrl();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <DialogHeader className="p-6 bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 text-white">
        <div className="flex justify-between items-start">
          <DialogTitle className="text-2xl font-bold text-white">Lead Details</DialogTitle>
          <div className="flex items-center gap-2">
            {linkedInUrl && (
              <motion.a
                href={linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0077B5] hover:bg-[#0077B5]/90 text-white p-2 rounded-full transition-transform hover:scale-110"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Linkedin className="h-4 w-4" />
              </motion.a>
            )}
            <DialogClose className="text-white hover:text-white/80 rounded-full p-1.5 bg-white/20 hover:bg-white/30 transition-colors">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
        </div>
      </DialogHeader>
    </motion.div>
  );
};

export default LeadDetailHeader;
