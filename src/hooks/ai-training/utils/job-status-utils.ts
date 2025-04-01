
import { JobStatus } from '../types';
import { Json } from '@/integrations/supabase/types';
import { parseFaqs } from '@/types/ai-training';

/**
 * Process job data from database and update state accordingly
 */
export function processJobStatusData(
  data: any,
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
  // Handle case where data might be null or undefined
  if (!data) {
    setError('No job data available');
    setIsLoading(false);
    setJobStatus('failed');
    return { isFailed: true, message: "No job data available" };
  }

  // Use lowercase properties consistently
  const status = (data.status || '').toLowerCase() as JobStatus;
  const progress = data.progress || 0;
  const summary = data.summary || '';
  const faqs = data.faqs || [];
  const pageCount = data.pagecount || 0;
  const domain = data.domain || '';
  const url = data.url || '';
  const error = data.error || '';
  
  console.log(`Job status update: ${status}, progress: ${progress}%`);
  
  // Always update the job status
  if (status) {
    setJobStatus(status as JobStatus);
  }
  
  // Process based on status
  if (status === 'completed') {
    setProgress(100);
    setSummary(summary);
    setFAQs(parseFaqs(faqs));
    setPageCount(pageCount);
    setUrl(url || '');
    setIsLoading(false);
    setError(null);
    
    return {
      isCompleted: true,
      isFailed: false,
      message: `Successfully analyzed ${domain || new URL(url).hostname}`,
    };
  } else if (status === 'failed') {
    setError(error || 'Job processing failed');
    setIsLoading(false);
    
    return {
      isCompleted: false,
      isFailed: true,
      message: error || "Processing failed",
    };
  } else if (status === 'processing') {
    // Ensure we keep the loading state active
    setIsLoading(true);
    setError(null);
    
    if (progress !== null && progress !== undefined) {
      setProgress(progress);
      
      // Update stage based on progress
      if (progress < 30) {
        setStage('Crawling Website');
      } else if (progress < 60) {
        setStage('Analyzing Content');
      } else if (progress < 85) {
        setStage('Generating AI Summary');
      } else {
        setStage('Creating FAQs');
      }
    }
  }
  
  return { isCompleted: false, isFailed: false, message: "" };
}

/**
 * Update stage based on progress
 */
export function updateStageFromProgress(progress: number): string {
  if (progress < 30) {
    return 'Crawling Website';
  } else if (progress < 60) {
    return 'Analyzing Content';
  } else if (progress < 85) {
    return 'Generating AI Summary';
  } else {
    return 'Creating FAQs';
  }
}
