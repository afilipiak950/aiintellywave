
import { Lead } from '@/types/lead';
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

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
      className="space-y-2"
    >
      <h3 className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
        <Tag className="h-4 w-4" />
        Tags
      </h3>
      <div className="flex flex-wrap gap-1">
        {lead.tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
            {tag}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
};

export default TagsSection;
