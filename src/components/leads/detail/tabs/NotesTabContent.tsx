
import { Lead } from '@/types/lead';
import { motion } from "framer-motion";
import { AlertCircle } from 'lucide-react';

interface NotesTabContentProps {
  lead: Lead;
}

const NotesTabContent = ({ lead }: NotesTabContentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Notes</h3>
      </div>
      
      {lead.notes ? (
        <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200">
          <p className="whitespace-pre-wrap">{lead.notes}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-2" />
          <p className="text-muted-foreground">No notes available for this lead</p>
        </div>
      )}
    </motion.div>
  );
};

export default NotesTabContent;
