
import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AISummary } from './AISummary';
import { FAQAccordion, FAQ } from './FAQAccordion';

interface TrainAIResultsProps {
  jobStatus: 'idle' | 'processing' | 'completed' | 'failed';
  summary: string;
  url: string;
  faqs: FAQ[];
  pageCount: number;
  selectedFilesCount: number;
  handleRetrain: () => void;
  isLoading: boolean;
}

export const TrainAIResults: React.FC<TrainAIResultsProps> = ({
  jobStatus,
  summary,
  url,
  faqs,
  pageCount,
  selectedFilesCount,
  handleRetrain,
  isLoading
}) => {
  if (!summary && jobStatus !== 'processing') return null;
  
  return (
    <>
      {jobStatus === 'processing' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 mb-6 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <p>Background processing in progress. Results will appear here when complete.</p>
          </div>
        </motion.div>
      )}
      
      {jobStatus === 'completed' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 mb-6 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <p>Analysis completed successfully! {faqs.length === 100 ? "100 FAQs generated and stored." : `${faqs.length} FAQs generated and stored.`}</p>
          </div>
        </motion.div>
      )}
      
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={handleRetrain}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          {isLoading ? "Processing..." : "Retrain AI"}
        </Button>
      </div>
      
      {summary && <AISummary summary={summary} url={url} />}
      {faqs.length > 0 && <FAQAccordion faqs={faqs} />}
      {pageCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4"
        >
          Analysis based on {pageCount} crawled pages and {selectedFilesCount} uploaded documents
        </motion.div>
      )}
    </>
  );
};
