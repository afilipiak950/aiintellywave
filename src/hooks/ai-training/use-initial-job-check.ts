
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { parseFaqs } from '@/types/ai-training';
import { JobStatus } from './types';

export function useInitialJobCheck(
  setActiveJobId: (id: string | null) => void,
  setJobStatus: (status: JobStatus) => void,
  setIsLoading: (isLoading: boolean) => void,
  setUrl: (url: string) => void,
  setSummary: (summary: string) => void,
  setFAQs: (faqs: any[]) => void,
  setPageCount: (count: number) => void,
  setProgress: (progress: number) => void,
  setStage: (stage: string) => void
) {
  const { toast } = useToast();

  // Check for active jobs on component mount
  useEffect(() => {
    const checkForActiveJobs = async () => {
      try {
        // First check for any processing jobs
        const { data: processingJobs, error: processingError } = await supabase
          .from('ai_training_jobs')
          .select('*')
          .eq('status', 'processing')
          .order('createdat', { ascending: false })
          .limit(1);
          
        if (processingError) {
          console.error('Error checking for processing jobs:', processingError);
        }
        
        // If there's an active processing job, use that one
        if (processingJobs && processingJobs.length > 0) {
          const activeJob = processingJobs[0];
          setActiveJobId(activeJob.jobid);
          setJobStatus('processing');
          setIsLoading(true);
          setUrl(activeJob.url || '');
          
          // Set progress and stage if available
          if (activeJob.progress) {
            setProgress(activeJob.progress);
            
            // Set appropriate stage based on progress
            if (activeJob.progress < 30) {
              setStage('Crawling Website');
            } else if (activeJob.progress < 60) {
              setStage('Analyzing Content');
            } else if (activeJob.progress < 85) {
              setStage('Generating AI Summary');
            } else {
              setStage('Creating FAQs');
            }
          }
          
          toast({
            title: "Processing In Progress",
            description: "Your analysis is actively being processed",
          });
          
          return;
        }
        
        // If no processing jobs, get the latest job of any status
        const { data, error } = await supabase
          .from('ai_training_jobs')
          .select('*')
          .order('createdat', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error checking for active jobs:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const latestJob = data[0];
          
          // Set active job ID regardless of status
          setActiveJobId(latestJob.jobid);
          
          if (latestJob.status === 'completed') {
            // Job is completed
            setJobStatus('completed');
            setSummary(latestJob.summary || '');
            setFAQs(parseFaqs(latestJob.faqs));
            setPageCount(latestJob.pagecount || 0);
            setUrl(latestJob.url || '');
            setIsLoading(false);
            
            if (!latestJob.summary) {
              toast({
                variant: "destructive",
                title: "Processing Issue",
                description: "Your analysis completed but no summary was generated",
              });
            }
          } else if (latestJob.status === 'failed') {
            // Job failed
            setJobStatus('failed');
            setIsLoading(false);
            
            toast({
              variant: "destructive",
              title: "Processing Failed",
              description: latestJob.error || "An error occurred during processing",
            });
          }
        }
      } catch (err) {
        console.error('Error checking for active jobs:', err);
      }
    };
    
    checkForActiveJobs();
  }, [toast, setActiveJobId, setJobStatus, setIsLoading, setUrl, setSummary, setFAQs, setPageCount, setProgress, setStage]);
}
