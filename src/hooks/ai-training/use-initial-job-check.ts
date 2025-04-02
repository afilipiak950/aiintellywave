
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { parseFaqs } from '@/types/ai-training';
import { JobStatus } from './types';

export function useInitialJobCheck(
  setActiveJobId: (id: string | null) => void,
  setJobStatus: (status: JobStatus) => void,
  setIsLoading: (isLoading: boolean) => void,
  setUrl: (url: string) => void,
  setSummary: (summary: string) => void,
  setFAQs: (faqs: any[]) => void,
  setPageCount: (pageCount: number) => void,
  setProgress: (progress: number) => void,
  setStage: (stage: string) => void
) {
  const { user } = useAuth();

  // Check if there's an active job for this user when the component mounts
  useEffect(() => {
    const checkForActiveJob = async () => {
      if (!user?.id) return;

      try {
        // First check for any processing jobs
        const { data: processingJobs, error: processingError } = await supabase
          .from('ai_training_jobs')
          .select('*')
          .eq('status', 'processing')
          .order('createdat', { ascending: false })
          .limit(1);
        
        if (processingError) {
          console.error('Error checking for active jobs:', processingError);
          return;
        }
        
        // If there's a processing job, set that as active
        if (processingJobs && processingJobs.length > 0) {
          const job = processingJobs[0];
          
          setActiveJobId(job.jobid);
          setJobStatus('processing');
          setIsLoading(true);
          setUrl(job.url || '');
          setProgress(job.progress || 0);
          
          // Update stage based on progress
          if (job.progress < 30) {
            setStage('Crawling Website');
          } else if (job.progress < 60) {
            setStage('Analyzing Content');
          } else if (job.progress < 85) {
            setStage('Generating AI Summary');
          } else {
            setStage('Creating FAQs');
          }
          
          return;
        }
        
        // If no processing job, check for most recent completed job
        const { data: completedJobs, error: completedError } = await supabase
          .from('ai_training_jobs')
          .select('*')
          .eq('status', 'completed')
          .order('createdat', { ascending: false })
          .limit(1);
        
        if (completedError) {
          console.error('Error checking for completed jobs:', completedError);
          return;
        }
        
        // If there's a completed job, load its results
        if (completedJobs && completedJobs.length > 0) {
          const job = completedJobs[0];
          
          setActiveJobId(job.jobid);
          setJobStatus('completed');
          setIsLoading(false);
          setUrl(job.url || '');
          setSummary(job.summary || '');
          setFAQs(parseFaqs(job.faqs));
          setPageCount(job.pagecount || 0);
          setProgress(100);
          
          return;
        }
        
      } catch (err) {
        console.error('Error in initial job check:', err);
      }
    };
    
    checkForActiveJob();
  }, [user?.id]);
}
