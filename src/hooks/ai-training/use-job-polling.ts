
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { JobStatus } from './types';
import { fetchJobStatus, updateJobStatus } from './utils/job-polling-service';
import { processJobStatusData } from './utils/job-status-utils';

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
  
  // Polling interval (in ms) - starts with shorter intervals then lengthens
  const SHORT_POLLING_INTERVAL = 3000; // 3 seconds for active jobs
  const LONG_POLLING_INTERVAL = 10000; // 10 seconds for jobs in progress > 30 seconds
  const MAX_RETRIES = 10;

  // Poll for job status updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let retries = 0;
    let consecutiveErrors = 0;
    let jobStartTime = Date.now();
    let useShortInterval = true;
    
    const pollJobStatus = async () => {
      if (!activeJobId) return;
      
      try {
        console.log(`Polling job status for job: ${activeJobId}, current status: ${jobStatus}`);
        
        const { data, error } = await fetchJobStatus(
          activeJobId,
          (errorMessage) => {
            consecutiveErrors++;
            retries++;
            
            if (retries >= MAX_RETRIES) {
              console.error(`Max retries (${MAX_RETRIES}) reached when polling job status`);
              setError(`Unable to fetch job status: ${errorMessage}. Please try again later.`);
              setIsLoading(false);
              setJobStatus('failed');
              
              // Mark the job as failed in the database as well
              updateJobStatus(activeJobId, 'failed', 0, errorMessage);
              
              // Clear the interval since we've hit max retries
              if (interval) {
                clearInterval(interval);
                interval = null;
              }
            }
          }
        );
        
        if (error) {
          consecutiveErrors++;
          console.error(`Error fetching job status: ${error}`);
          return;
        }
        
        // Reset error counters on successful fetch
        if (data) {
          retries = 0;
          consecutiveErrors = 0;
        
          const result = processJobStatusData(
            data,
            setJobStatus,
            setProgress,
            setStage,
            setSummary,
            setFAQs,
            setPageCount,
            setUrl,
            setIsLoading,
            setError
          );
          
          // Switch to longer polling interval after 30 seconds
          if (Date.now() - jobStartTime > 30000 && useShortInterval) {
            useShortInterval = false;
            if (interval) {
              clearInterval(interval);
              interval = setInterval(pollJobStatus, LONG_POLLING_INTERVAL);
              console.log(`Switching to longer polling interval (${LONG_POLLING_INTERVAL}ms) for job ${activeJobId}`);
            }
          }
          
          // Handle completed state
          if (result.isCompleted) {
            toast({
              title: "Analysis Complete",
              description: result.message,
            });
            
            // Clear the interval on completion
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          }
          
          // Handle failed state
          if (result.isFailed) {
            toast({
              variant: "destructive",
              title: "Error",
              description: result.message,
            });
            
            // Clear the interval on failure
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          }
        } else {
          // No data returned but no error either - job not found or deleted
          console.warn(`No data found for job ${activeJobId}`);
          consecutiveErrors++;
          
          if (consecutiveErrors >= 3) {
            setError('Job not found or deleted. Please try again.');
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
        console.error('Error in polling loop:', err);
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
      jobStartTime = Date.now();
      useShortInterval = true;
      pollJobStatus();
      
      // Set up polling interval if it's not already set up
      if (!interval) {
        console.log(`Setting up polling for job ${activeJobId} with interval ${SHORT_POLLING_INTERVAL}ms`);
        interval = setInterval(pollJobStatus, SHORT_POLLING_INTERVAL);
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
