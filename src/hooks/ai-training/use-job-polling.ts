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
  
  // Extended polling interval (in ms)
  const POLLING_INTERVAL = 5000;

  // Poll for job status updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let retries = 0;
    const MAX_RETRIES = 3;
    
    const fetchJobStatus = async () => {
      if (!activeJobId) return;
      
      try {
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
            retries = 0;
            return;
          }
          return;
        }
        
        // Reset retry counter on successful fetch
        retries = 0;
        
        if (data) {
          // Always update the job status
          setJobStatus(data.status as JobStatus);
          
          if (data.status === 'completed') {
            setProgress(100);
            setSummary(data.summary || '');
            setFAQs(parseFaqs(data.faqs));
            setPageCount(data.pagecount || 0);
            setUrl(data.url || '');
            setIsLoading(false);
            
            toast({
              title: "Analysis Complete",
              description: `Successfully analyzed ${data.domain || new URL(data.url).hostname}`,
            });
            
            if (interval) clearInterval(interval);
          } else if (data.status === 'failed') {
            setError(data.error || 'Job processing failed');
            setIsLoading(false);
            
            toast({
              variant: "destructive",
              title: "Error",
              description: data.error || "Processing failed",
            });
            
            if (interval) clearInterval(interval);
          } else if (data.status === 'processing') {
            // Ensure we keep the loading state active
            setIsLoading(true);
            
            if (data.progress) {
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
      } catch (err) {
        console.error('Error polling job status:', err);
        retries++;
        
        if (retries >= MAX_RETRIES) {
          console.error(`Max retries (${MAX_RETRIES}) reached when polling job status`);
          retries = 0;
        }
      }
    };
    
    if (activeJobId && (jobStatus === 'processing' || jobStatus === 'idle')) {
      // Immediately check status once
      fetchJobStatus();
      
      // Then set up regular polling
      interval = setInterval(fetchJobStatus, POLLING_INTERVAL);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeJobId, jobStatus, toast, setJobStatus, setProgress, setStage, setSummary, 
      setFAQs, setPageCount, setUrl, setIsLoading, setError]);
}
