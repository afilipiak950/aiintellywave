
import React, { useState, useEffect } from 'react';
import { AnimatedCircuitBackground } from '../../components/train-ai/AnimatedCircuitBackground';
import { TrainAIHeader } from '../../components/train-ai/TrainAIHeader';
import { UrlInputForm } from '../../components/train-ai/UrlInputForm';
import { LoadingAnimation } from '../../components/train-ai/LoadingAnimation';
import { AISummary } from '../../components/train-ai/AISummary';
import { FAQAccordion, FAQ } from '../../components/train-ai/FAQAccordion';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TrainAIPage: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const { toast } = useToast();

  // Effect to simulate progress updates while loading
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      // Start at 0 progress
      setProgress(0);
      
      // Update progress every 200ms
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          // Slow down the progress as we approach higher values
          // This gives a more realistic appearance of a process that might take longer
          const increment = prevProgress < 30 ? 1 : 
                          prevProgress < 60 ? 0.7 : 
                          prevProgress < 85 ? 0.4 : 0.2;
                          
          const newProgress = prevProgress + increment;
          
          // Update loading stage based on progress
          if (newProgress < 30) {
            setStage('Crawling Website');
          } else if (newProgress < 60) {
            setStage('Analyzing Content');
          } else if (newProgress < 85) {
            setStage('Generating AI Summary');
          } else {
            setStage('Creating FAQs');
          }
          
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 200);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const handleSubmit = async (websiteUrl: string) => {
    try {
      setUrl(websiteUrl);
      setIsLoading(true);
      setError(null);
      setSummary('');
      setFAQs([]);
      setPageCount(0);
      
      // Call the edge function to crawl and analyze the website
      const { data, error } = await supabase.functions.invoke('website-crawler', {
        body: {
          url: websiteUrl,
          maxPages: 30,  // Limit to 30 pages for reasonable response times
          maxDepth: 2    // Maximum depth of 2 levels for crawling
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to analyze the website');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze the website');
      }
      
      // Complete progress to 100%
      setProgress(100);
      
      // Set the retrieved data
      setSummary(data.summary);
      setFAQs(data.faqs || []);
      setPageCount(data.pageCount || 0);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${data.domain || new URL(websiteUrl).hostname}`,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to analyze the website. Please try again.');
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to analyze the website",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 relative">
      {/* Animated background */}
      <AnimatedCircuitBackground />
      
      {/* Content */}
      <div className="relative z-10">
        <TrainAIHeader />
        
        <UrlInputForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
        
        <AnimatePresence>
          {/* Loading animation */}
          {isLoading && (
            <LoadingAnimation 
              progress={progress}
              stage={stage} 
            />
          )}
          
          {/* Error message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg mb-8"
            >
              <AlertCircle size={20} />
              <p>{error}</p>
            </motion.div>
          )}
          
          {/* Results: Summary and FAQs */}
          {!isLoading && summary && (
            <>
              <AISummary summary={summary} url={url} />
              {faqs.length > 0 && <FAQAccordion faqs={faqs} />}
              {pageCount > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4"
                >
                  Analysis based on {pageCount} crawled pages
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrainAIPage;
