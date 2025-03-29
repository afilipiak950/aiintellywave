
import { Lead } from '@/types/lead';
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface TagsSectionProps {
  lead: Lead;
}

const TagsSection = ({ lead }: TagsSectionProps) => {
  if (!lead.tags || lead.tags.length === 0) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <h3 className="text-sm font-medium mb-2 text-muted-foreground">Tags</h3>
      <div className="flex flex-wrap gap-1">
        {lead.tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="bg-slate-100">
            {tag}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
};

export default TagsSection;
