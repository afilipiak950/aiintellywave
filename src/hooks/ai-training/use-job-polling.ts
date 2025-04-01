
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

  // Poll for job status updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    const fetchJobStatus = async () => {
      if (!activeJobId) return;
      
      try {
        const { data, error } = await supabase
          .from('ai_training_jobs')
          .select('*')
          .eq('jobid', activeJobId);
        
        if (error) {
          console.error('Error fetching job status:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const jobData = data[0]; // Get the first (and should be only) result
          setJobStatus(jobData.status as JobStatus);
          
          if (jobData.status === 'completed') {
            setProgress(100);
            setSummary(jobData.summary || '');
            setFAQs(parseFaqs(jobData.faqs));
            setPageCount(jobData.pagecount || 0);
            setUrl(jobData.url || '');
            setIsLoading(false);
            
            toast({
              title: "Analysis Complete",
              description: `Successfully analyzed ${jobData.domain || new URL(jobData.url).hostname}`,
            });
            
            if (interval) clearInterval(interval);
          } else if (jobData.status === 'failed') {
            setError(jobData.error || 'Job processing failed');
            setIsLoading(false);
            
            toast({
              variant: "destructive",
              title: "Error",
              description: jobData.error || "Processing failed",
            });
            
            if (interval) clearInterval(interval);
          } else if (jobData.status === 'processing') {
            if (jobData.progress) {
              setProgress(jobData.progress);
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
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    };
    
    if (activeJobId && jobStatus === 'processing') {
      interval = setInterval(fetchJobStatus, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeJobId, jobStatus, toast, setJobStatus, setProgress, setStage, setSummary, 
      setFAQs, setPageCount, setUrl, setIsLoading, setError]);
}
