
import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AISummary } from './AISummary';
import { FAQAccordion, FAQ } from './FAQAccordion';
import { Skeleton } from "@/components/ui/skeleton";

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
  // Show the component under these conditions:
  // 1. We're processing (show the processing message)
  // 2. We have a failed job (show the error)
  // 3. We have a completed job with results
  // 4. Always show when jobStatus is not idle
  const shouldShow = jobStatus !== 'idle';
  
  if (!shouldShow) return null;
  
  return (
    <>
      {jobStatus === 'processing' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 mb-6 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-pulse" />
            <p className="font-medium">Background processing in progress. Results will appear here when complete.</p>
          </div>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            You can leave this page and come back later. The processing will continue in the background.
          </div>
        </motion.div>
      )}
      
      {jobStatus === 'completed' && (summary || faqs.length > 0) && (
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
      
      {jobStatus === 'failed' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 mb-6 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>Processing failed. Please try again or contact support if the problem persists.</p>
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
      
      {jobStatus === 'processing' ? (
        <div className="space-y-4 mb-6">
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <>
          {summary && <AISummary summary={summary} url={url} />}
          {faqs.length > 0 && <FAQAccordion faqs={faqs} />}
        </>
      )}
      
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
