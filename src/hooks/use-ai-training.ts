
import { useState } from 'react';
import { FAQ } from '@/components/train-ai/FAQAccordion';
import { useFileHandling } from './ai-training/use-file-handling';
import { useInitialJobCheck } from './ai-training/use-initial-job-check';
import { useJobPolling } from './ai-training/use-job-polling';
import { useProgressSimulation } from './ai-training/use-progress-simulation';
import { useJobSubmission } from './ai-training/use-job-submission';
import { JobStatus } from './ai-training/types';
import { useAuth } from '@/context/auth';

export function useAITraining() {
  const { user } = useAuth();
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus>('idle');

  // Import modular hook functionality
  const { processFiles } = useFileHandling();
  const { submitJob } = useJobSubmission();

  // Set up initial job check on component mount
  useInitialJobCheck(
    user?.id,
    setActiveJobId,
    setJobStatus,
    setIsLoading,
    setUrl,
    setSummary,
    setFAQs,
    setPageCount,
    setProgress,
    setStage
  );

  // Set up job polling
  useJobPolling(
    activeJobId,
    jobStatus,
    setJobStatus,
    setProgress,
    setStage,
    setSummary,
    setFAQs,
    setPageCount,
    setUrl,
    setIsLoading,
    setError
  );

  // Set up progress simulation
  useProgressSimulation(isLoading, activeJobId, setProgress, setStage);

  // Handle file selection
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
  };

  // Clear files selection
  const clearFiles = () => {
    setSelectedFiles([]);
  };

  // Handle form submission
  const handleSubmit = async (websiteUrl: string) => {
    try {
      if (websiteUrl) {
        setUrl(websiteUrl);
      } else if (!selectedFiles.length) {
        throw new Error('Please enter a URL or upload documents');
      }
      
      const documentData = await processFiles(selectedFiles, setIsUploading, setError);
      
      await submitJob(
        websiteUrl,
        documentData,
        user?.id,
        setIsLoading,
        setError,
        setSummary,
        setFAQs,
        setPageCount,
        setActiveJobId,
        setJobStatus
      );
    } catch (err: any) {
      // Error handling is done in submitJob
    }
  };

  // Retrain function
  const handleRetrain = () => {
    clearFiles(); // Clear any previously selected files
    handleSubmit(url);
  };

  return {
    url,
    setUrl,
    isLoading,
    isUploading,
    progress,
    stage,
    summary,
    faqs,
    error,
    pageCount,
    selectedFiles,
    jobStatus,
    handleFilesSelected,
    handleSubmit,
    handleRetrain,
    clearFiles,
    userId: user?.id
  };
}
