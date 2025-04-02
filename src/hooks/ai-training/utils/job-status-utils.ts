
import { AITrainingJob, parseFaqs } from '@/types/ai-training';
import { FAQ } from '@/components/train-ai/FAQAccordion';
import { JobStatus } from '../types';

export function getStageFromProgress(progress: number): string {
  if (progress === 0) return 'Initializing crawler and preparing job';
  if (progress < 10) return 'Connecting to website';
  if (progress < 20) return 'Analyzing website structure';
  if (progress < 40) return 'Extracting content from pages';
  if (progress < 60) return 'Processing content';
  if (progress < 70) return 'Analyzing information';
  if (progress < 85) return 'Generating summary';
  if (progress < 95) return 'Creating FAQs';
  return 'Finalizing results';
}

export function processJobStatusData(
  data: AITrainingJob,
  setJobStatus: (status: JobStatus) => void,
  setProgress: (progress: number) => void,
  setStage: (stage: string) => void,
  setSummary: (summary: string) => void,
  setFAQs: (faqs: FAQ[]) => void,
  setPageCount: (pageCount: number) => void,
  setUrl: (url: string) => void,
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: string | null) => void
) {
  if (!data) {
    return { isCompleted: false, isFailed: false, message: '' };
  }

  console.log(`Job status update: ${data.status}, progress: ${data.progress || 0}%`);
  
  // If there's an error on the job but status isn't failed, log it
  if (data.error && data.status !== 'failed') {
    console.warn(`Job has error but status is ${data.status}: ${data.error}`);
  }
  
  // Update status
  if (data.status) {
    setJobStatus(data.status as JobStatus);
  }
  
  // Update progress and stage
  const progress = data.progress || 0;
  setProgress(progress);
  
  // Set stage based on progress
  const stage = getStageFromProgress(progress);
  setStage(stage);
  
  // Update URL if available
  if (data.url) {
    setUrl(data.url);
  }
  
  // If completed, update results
  if (data.status === 'completed') {
    if (data.summary) {
      setSummary(data.summary);
    }
    
    if (data.faqs) {
      const parsedFaqs = parseFaqs(data.faqs);
      setFAQs(parsedFaqs);
    }
    
    if (data.pagecount !== undefined && data.pagecount !== null) {
      setPageCount(data.pagecount);
    }
    
    setIsLoading(false);
    return { 
      isCompleted: true, 
      isFailed: false, 
      message: `Analysis of ${data.domain || 'content'} completed successfully.` 
    };
  }
  
  // If failed, set error
  if (data.status === 'failed') {
    setIsLoading(false);
    
    if (data.error) {
      setError(data.error);
    } else {
      setError('Processing failed for unknown reasons.');
    }
    
    return { 
      isCompleted: false, 
      isFailed: true, 
      message: data.error || 'Analysis failed. Please try again.' 
    };
  }
  
  return { isCompleted: false, isFailed: false, message: '' };
}
