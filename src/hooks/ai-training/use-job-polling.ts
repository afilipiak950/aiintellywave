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
        
        // Use `select('*')` to ensure we get all fields even if they're null
        const { data, error } = await supabase
          .from('ai_training_jobs')
          .select('*')
          .eq('jobid', activeJobId)
          .limit(1);
        
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
        
        if (data && data.length > 0) {
          const jobData = data[0];
          console.log(`Job status update: ${jobData.status}, progress: ${jobData.progress || 0}%`);
          
          // Always update the job status
          setJobStatus(jobData.status as JobStatus);
          
          if (jobData.status === 'completed') {
            setProgress(100);
            setSummary(jobData.summary || '');
            setFAQs(parseFaqs(jobData.faqs || []));
            setPageCount(jobData.pagecount || 0);
            setUrl(jobData.url || '');
            setIsLoading(false);
            
            toast({
              title: "Analysis Complete",
              description: `Successfully analyzed ${jobData.domain || new URL(jobData.url).hostname}`,
            });
            
            // Only clear the interval on completion
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          } else if (jobData.status === 'failed') {
            setError(jobData.error || 'Job processing failed');
            setIsLoading(false);
            
            toast({
              variant: "destructive",
              title: "Error",
              description: jobData.error || "Processing failed",
            });
            
            // Only clear the interval on failure
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          } else if (jobData.status === 'processing') {
            // Ensure we keep the loading state active
            setIsLoading(true);
            
            if (jobData.progress !== null && jobData.progress !== undefined) {
              setProgress(jobData.progress);
              
              // Update stage based on progress
              if (jobData.progress < 30) {
                setStage('Crawling Website');
              } else if (jobData.progress < 60) {
                setStage('Analyzing Content');
              } else if (jobData.progress < 85) {
                setStage('Generating AI Summary');
              } else {
                setStage('Creating FAQs');
              }
            }
          }
        } else {
          console.error('Job not found in database:', activeJobId);
          setError(`Job ID ${activeJobId} not found in the database`);
          setIsLoading(false);
          
          // Clear the interval since the job does not exist
          if (interval) {
            clearInterval(interval);
            interval = null;
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
