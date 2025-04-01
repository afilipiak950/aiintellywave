
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { JobStatus } from './types';
import { fetchJobStatus } from './utils/job-polling-service';
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
  
  // Polling interval (in ms)
  const POLLING_INTERVAL = 5000;
  const MAX_RETRIES = 10;

  // Poll for job status updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let retries = 0;
    let consecutiveErrors = 0;
    
    const pollJobStatus = async () => {
      if (!activeJobId) return;
      
      try {
        console.log(`Polling job status for job: ${activeJobId}, current status: ${jobStatus}`);
        
        const { data } = await fetchJobStatus(
          activeJobId,
          (errorMessage) => {
            consecutiveErrors++;
            retries++;
            
            if (retries >= MAX_RETRIES) {
              console.error(`Max retries (${MAX_RETRIES}) reached when polling job status`);
              setError(`Unable to fetch job status: ${errorMessage}. Please try again later.`);
              setIsLoading(false);
              setJobStatus('failed');
              
              // Clear the interval since we've hit max retries
              if (interval) {
                clearInterval(interval);
                interval = null;
              }
            }
          }
        );
        
        // Reset error counters on successful fetch
        retries = 0;
        consecutiveErrors = 0;
        
        if (data) {
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
      pollJobStatus();
      
      // Set up polling interval if it's not already set up
      if (!interval) {
        console.log(`Setting up polling for job ${activeJobId} with interval ${POLLING_INTERVAL}ms`);
        interval = setInterval(pollJobStatus, POLLING_INTERVAL);
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
