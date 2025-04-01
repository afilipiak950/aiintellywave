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
  const MAX_RETRIES = 3;

  // Poll for job status updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let retries = 0;
    
    const fetchJobStatus = async () => {
      if (!activeJobId) return;
      
      try {
        console.log(`Polling job status for job: ${activeJobId}`);
        
        const { data, error } = await supabase
          .from('ai_training_jobs')
          .select('*')
          .eq('jobid', activeJobId)
          .single();
        
        if (error) {
          console.error('Error fetching job status:', error);
          retries++;
          
          if (retries >= MAX_RETRIES) {
            console.error(`Max retries (${MAX_RETRIES}) reached when polling job status`);
            setError(`Failed to check job status after ${MAX_RETRIES} attempts`);
            
            // Keep polling despite errors, but reset retry counter
            retries = 0;
          }
          return;
        }
        
        // Reset retry counter on successful fetch
        retries = 0;
        
        if (data) {
          console.log(`Job status update: ${data.status}, progress: ${data.progress || 0}%`);
          
          // Always update the job status
          setJobStatus(data.status as JobStatus);
          
          if (data.status === 'completed') {
            setProgress(100);
            setSummary(data.summary || '');
            setFAQs(parseFaqs(data.faqs || []));
            setPageCount(data.pagecount || 0);
            setUrl(data.url || '');
            setIsLoading(false);
            
            toast({
              title: "Analysis Complete",
              description: `Successfully analyzed ${data.domain || new URL(data.url).hostname}`,
            });
            
            // Only clear the interval on completion
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          } else if (data.status === 'failed') {
            setError(data.error || 'Job processing failed');
            setIsLoading(false);
            
            toast({
              variant: "destructive",
              title: "Error",
              description: data.error || "Processing failed",
            });
            
            // Only clear the interval on failure
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          } else if (data.status === 'processing') {
            // Ensure we keep the loading state active
            setIsLoading(true);
            
            if (data.progress !== null && data.progress !== undefined) {
              setProgress(data.progress);
              
              // Update stage based on progress
              if (data.progress < 30) {
                setStage('Crawling Website');
              } else if (data.progress < 60) {
                setStage('Analyzing Content');
              } else if (data.progress < 85) {
                setStage('Generating AI Summary');
              } else {
                setStage('Creating FAQs');
              }
            }
          }
        }
      } catch (err: any) {
        console.error('Error polling job status:', err);
        retries++;
        
        if (retries >= MAX_RETRIES) {
          console.error(`Max retries (${MAX_RETRIES}) reached when polling job status`);
          setError(`Network error while checking job status: ${err.message}`);
          retries = 0;
        }
      }
    };
    
    // Check if we should set up polling
    if (activeJobId) {
      // Immediately check status once
      fetchJobStatus();
      
      // Set up polling interval if it's not already set up
      if (jobStatus === 'processing' && !interval) {
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
