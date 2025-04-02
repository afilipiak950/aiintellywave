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
  setPageCount: (count: number) => void,
  setProgress: (progress: number) => void,
  setStage: (stage: string) => void
) {
  // Check for active jobs on component mount
  useEffect(() => {
    async function checkForActiveJobs() {
      if (!userId) return;
      
      try {
        console.log('Checking for active jobs for user', userId);
        
        // Get most recent processing job, if any
        const { data: processingJob, error: processingError } = await supabase
          .from('ai_training_jobs')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'processing')
          .order('createdat', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (processingError) {
          console.error('Error checking for processing jobs:', processingError);
        }
        
        // If we have a processing job, use that
        if (processingJob) {
          console.log('Found active processing job:', processingJob.jobid);
          setActiveJobId(processingJob.jobid);
          setJobStatus('processing');
          setIsLoading(true);
          if (processingJob.url) setUrl(processingJob.url);
          setProgress(processingJob.progress || 0);
          return;
        }
        
        // Otherwise, get most recent completed job, if any
        const { data: completedJob, error: completedError } = await supabase
          .from('ai_training_jobs')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .order('createdat', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (completedError) {
          console.error('Error checking for completed jobs:', completedError);
        }
        
        // If we have a completed job, use that
        if (completedJob) {
          console.log('Found most recent completed job:', completedJob.jobid);
          setActiveJobId(completedJob.jobid);
          setJobStatus('completed');
          setIsLoading(false);
          
          if (completedJob.url) setUrl(completedJob.url);
          if (completedJob.summary) setSummary(completedJob.summary);
          
          // Fix: Explicitly type the return of parseFaqs as FAQ[]
          const parsedFaqs: FAQ[] = parseFaqs(completedJob.faqs);
          setFAQs(parsedFaqs);
          
          if (completedJob.pagecount !== null && completedJob.pagecount !== undefined) {
            setPageCount(completedJob.pagecount);
          }
          
          return;
        }
        
        console.log('No active or completed jobs found');
        
      } catch (err) {
        console.error('Error checking for active jobs:', err);
      }
    }
    
    checkForActiveJobs();
  }, [userId, setActiveJobId, setJobStatus, setIsLoading, setUrl, setSummary, setFAQs, setPageCount, setProgress, setStage]);
}
