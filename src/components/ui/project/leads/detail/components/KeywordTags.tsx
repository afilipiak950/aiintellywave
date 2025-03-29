
import { ExcelRow } from '../../../../../../types/project';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Hash } from 'lucide-react';

interface KeywordTagsProps {
  lead: ExcelRow;
}

const KeywordTags = ({ lead }: KeywordTagsProps) => {
  // Helper function to extract keywords
  const getKeywords = () => lead.row_data["Keywords"] || "";

  if (!getKeywords()) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Hash className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-wrap gap-1">
          {getKeywords().split(',').map((keyword, index) => (
            <Badge key={index} variant="secondary" className="whitespace-nowrap">
              {keyword.trim()}
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default KeywordTags;
