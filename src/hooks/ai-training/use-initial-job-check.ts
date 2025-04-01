
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
  setPageCount: (count: number) => void
) {
  const { toast } = useToast();

  // Check for active jobs on component mount
  useEffect(() => {
    const checkForActiveJobs = async () => {
      try {
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
          
          if (latestJob.status === 'processing') {
            setActiveJobId(latestJob.jobid);
            setJobStatus('processing');
            setIsLoading(true);
            setUrl(latestJob.url || '');
            
            toast({
              title: "Processing In Progress",
              description: "Your previous analysis is still being processed",
            });
          } else if (latestJob.status === 'completed') {
            setActiveJobId(latestJob.jobid);
            setJobStatus('completed');
            setSummary(latestJob.summary || '');
            setFAQs(parseFaqs(latestJob.faqs));
            setPageCount(latestJob.pagecount || 0);
            setUrl(latestJob.url || '');
          }
        }
      } catch (err) {
        console.error('Error checking for active jobs:', err);
      }
    };
    
    checkForActiveJobs();
  }, [toast, setActiveJobId, setJobStatus, setIsLoading, setUrl, setSummary, setFAQs, setPageCount]);
}
