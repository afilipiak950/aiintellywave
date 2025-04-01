
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
      console.log('Checking for active AI training jobs...');
      
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
          toast({
            variant: "destructive",
            title: "Database Error",
            description: "Failed to check for active processing jobs"
          });
          return;
        }
        
        // If there's an active processing job, use that one
        if (processingJobs && processingJobs.length > 0) {
          const activeJob = processingJobs[0];
          console.log('Found active processing job:', activeJob.jobid);
          
          setActiveJobId(activeJob.jobid);
          setJobStatus('processing');
          setIsLoading(true);
          setUrl(activeJob.url || '');
          
          // Set progress and stage if available
          if (activeJob.progress !== null && activeJob.progress !== undefined) {
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
          } else {
            // Default values if progress is not available
            setProgress(10);
            setStage('Processing...');
          }
          
          toast({
            title: "Processing In Progress",
            description: "Your analysis is actively being processed in the background",
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
          console.error('Error checking for latest job:', error);
          toast({
            variant: "destructive",
            title: "Database Error",
            description: "Failed to check job status"
          });
          return;
        }
        
        if (data && data.length > 0) {
          const latestJob = data[0];
          console.log('Found latest job with status:', latestJob.status);
          
          // Set active job ID regardless of status
          setActiveJobId(latestJob.jobid);
          
          if (latestJob.status === 'completed') {
            // Job is completed
            setJobStatus('completed');
            setSummary(latestJob.summary || '');
            setFAQs(parseFaqs(latestJob.faqs || []));
            setPageCount(latestJob.pagecount || 0);
            setUrl(latestJob.url || '');
            setIsLoading(false);
            
            if (!latestJob.summary && !latestJob.faqs) {
              toast({
                variant: "destructive",
                title: "Processing Issue",
                description: "Your analysis completed but no data was generated",
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
          } else if (latestJob.status === 'processing') {
            // Job is still processing
            setJobStatus('processing');
            setIsLoading(true);
            setProgress(latestJob.progress || 10);
            setStage(getStageFromProgress(latestJob.progress || 10));
            
            toast({
              title: "Processing In Progress",
              description: "Your analysis is continuing in the background",
            });
          }
        } else {
          console.log('No AI training jobs found in database');
        }
      } catch (err: any) {
        console.error('Error checking for active jobs:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to check job status"
        });
      }
    };
    
    // Helper function to get stage from progress
    const getStageFromProgress = (progress: number): string => {
      if (progress < 30) return 'Crawling Website';
      if (progress < 60) return 'Analyzing Content';
      if (progress < 85) return 'Generating AI Summary';
      return 'Creating FAQs';
    };
    
    checkForActiveJobs();
  }, [toast, setActiveJobId, setJobStatus, setIsLoading, setUrl, setSummary, setFAQs, setPageCount, setProgress, setStage]);
}
