
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink } from 'lucide-react';

interface AISummaryProps {
  summary: string;
  url: string;
}

export const AISummary: React.FC<AISummaryProps> = ({ summary, url }) => {
  const domain = url ? new URL(url).hostname : '';
  
  // Format summary with highlights for key terms
  const formattedSummary = summary.split('\n').map((paragraph, index) => (
    paragraph ? <p key={index} className="mb-4">{paragraph}</p> : null
  ));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">AI Summary</h2>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span>Generated for:</span>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline"
        >
          {domain} <ExternalLink size={14} />
        </a>
      </div>
      
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
        {formattedSummary}
      </div>
    </motion.div>
  );
};
