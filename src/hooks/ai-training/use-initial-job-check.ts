
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { parseFaqs } from '@/types/ai-training';
import { JobStatus } from './types';
import { FAQ } from '@/components/train-ai/FAQAccordion';

export function useInitialJobCheck(
  userId: string | undefined,
  setActiveJobId: (id: string | null) => void,
  setJobStatus: (status: JobStatus) => void,
  setIsLoading: (isLoading: boolean) => void,
  setUrl: (url: string) => void,
  setSummary: (summary: string) => void,
  setFAQs: (faqs: FAQ[]) => void,
  setPageCount: (pageCount: number) => void,
  setProgress: (progress: number) => void,
  setStage: (stage: string) => void
) {
  // Check if there's an active job for this user when the component mounts
  useEffect(() => {
    const checkForActiveJob = async () => {
      if (!userId) return;

      try {
        // First check for any processing jobs for this user
        const { data: processingJobs, error: processingError } = await supabase
          .from('ai_training_jobs')
          .select('*')
          .eq('status', 'processing')
          .eq('user_id', userId)
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
          .eq('user_id', userId)
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
          
          // Use the FAQ type directly to avoid deep type recursion
          const parsedFaqs = parseFaqs(job.faqs) as FAQ[];
          setFAQs(parsedFaqs);
          
          setPageCount(job.pagecount || 0);
          setProgress(100);
          
          return;
        }
        
      } catch (err) {
        console.error('Error in initial job check:', err);
      }
    };
    
    checkForActiveJob();
  }, [userId]);
}
