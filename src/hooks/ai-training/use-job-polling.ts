import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { parseFaqs } from '@/types/ai-training';
import { JobStatus } from './types';

export function useJobPolling(
  activeJobId: string | null,
  jobStatus: JobStatus,
  setJobStatus: (status: JobStatus) => void,
  setProgress: (progress: number) => void,
  setStage: (stage: string) => void,
  setSummary: (summary: string) => void,
  setFAQs: (faqs: any[]) => void,
  setPageCount: (pageCount: number) => void,
  setUrl: (url: string) => void,
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: string | null) => void
) {
  const { toast } = useToast();
  
  // Polling interval (in ms)
  const POLLING_INTERVAL = 5000;
  const MAX_RETRIES = 5; // Increase max retries for more resilience

  // Poll for job status updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let retries = 0;
    let consecutiveErrors = 0;
    
    const fetchJobStatus = async () => {
      if (!activeJobId) return;
      
      try {
        console.log(`Polling job status for job: ${activeJobId}, current status: ${jobStatus}`);
        
        // Check if the job exists in the database
        const { data, error } = await supabase
          .from('ai_training_jobs')
          .select('*')
          .eq('jobid', activeJobId)
          .single();
        
        if (error) {
          console.error('Error fetching job status:', error);
          consecutiveErrors++;
          retries++;
          
          if (retries >= MAX_RETRIES) {
            console.error(`Max retries (${MAX_RETRIES}) reached when polling job status`);
            setError(`Unable to fetch job status: ${error.message}. Please try again later.`);
            setIsLoading(false);
            setJobStatus('failed');
            
            // Clear the interval since we've hit max retries
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          }
          return;
        }
        
        // Reset error counters on successful fetch
        retries = 0;
        consecutiveErrors = 0;
        
        if (data) {
          // Use lowercase properties consistently
          const status = (data.status || '').toLowerCase() as JobStatus;
          const progress = data.progress || 0;
          const summary = data.summary || '';
          const faqs = data.faqs || [];
          const pageCount = data.pagecount || 0;
          const domain = data.domain || '';
          const url = data.url || '';
          const error = data.error || '';
          
          console.log(`Job status update: ${status}, progress: ${progress}%`);
          
          // Always update the job status
          if (status) {
            setJobStatus(status as JobStatus);
          }
          
          // Process based on status
          if (status === 'completed') {
            setProgress(100);
            setSummary(summary);
            setFAQs(parseFaqs(faqs));
            setPageCount(pageCount);
            setUrl(url || '');
            setIsLoading(false);
            setError(null);
            
            toast({
              title: "Analysis Complete",
              description: `Successfully analyzed ${domain || new URL(url).hostname}`,
            });
            
            // Clear the interval on completion
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          } else if (status === 'failed') {
            setError(error || 'Job processing failed');
            setIsLoading(false);
            
            toast({
              variant: "destructive",
              title: "Error",
              description: error || "Processing failed",
            });
            
            // Clear the interval on failure
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          } else if (status === 'processing') {
            // Ensure we keep the loading state active
            setIsLoading(true);
            setError(null);
            
            if (progress !== null && progress !== undefined) {
              setProgress(progress);
              
              // Update stage based on progress
              if (progress < 30) {
                setStage('Crawling Website');
              } else if (progress < 60) {
                setStage('Analyzing Content');
              } else if (progress < 85) {
                setStage('Generating AI Summary');
              } else {
                setStage('Creating FAQs');
              }
            }
          }
        } else {
          // No data returned but no error either - the job might have been deleted
          console.warn(`No data found for job ${activeJobId}`);
          consecutiveErrors++;
          
          if (consecutiveErrors >= 3) {
            setError('Job data not found. It may have been deleted.');
            setIsLoading(false);
            setJobStatus('failed');
            
            // Clear the interval since the job doesn't seem to exist
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          }
        }
      } catch (err: any) {
        console.error('Error polling job status:', err);
        retries++;
        consecutiveErrors++;
        
        if (retries >= MAX_RETRIES) {
          console.error(`Max retries (${MAX_RETRIES}) reached when polling job status`);
          setError(`Network error while checking job status: ${err.message}`);
          setIsLoading(false);
          setJobStatus('failed');
          
          // Clear the interval after max retries
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
        }
      }
    };
    
    // Check if we should set up polling
    if (activeJobId && (jobStatus === 'processing' || jobStatus === 'idle')) {
      // Immediately check status once
      fetchJobStatus();
      
      // Set up polling interval if it's not already set up
      if (!interval) {
        console.log(`Setting up polling for job ${activeJobId} with interval ${POLLING_INTERVAL}ms`);
        interval = setInterval(fetchJobStatus, POLLING_INTERVAL);
      }
    }
    
    return () => {
      if (interval) {
        console.log('Cleaning up polling interval');
        clearInterval(interval);
        interval = null;
      }
    };
  }, [activeJobId, jobStatus, toast, setJobStatus, setProgress, setStage, setSummary, 
      setFAQs, setPageCount, setUrl, setIsLoading, setError]);
}
