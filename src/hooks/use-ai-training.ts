
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FAQ } from '@/components/train-ai/FAQAccordion';
import { useFileHandling } from './ai-training/use-file-handling';
import { useInitialJobCheck } from './ai-training/use-initial-job-check';
import { useJobPolling } from './ai-training/use-job-polling';
import { useProgressSimulation } from './ai-training/use-progress-simulation';
import { useJobSubmission } from './ai-training/use-job-submission';
import { JobStatus } from './ai-training/types';
import { useAuth } from '@/context/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { parseFaqs } from '@/types/ai-training';

export function useAITraining() {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const { handleCancelJob } = useJobPolling(
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

  // Cancel function
  const onCancelJob = async () => {
    if (isLoading && activeJobId) {
      const cancelled = await handleCancelJob();
      if (cancelled) {
        setIsLoading(false);
        setProgress(0);
        setStage('');
        setError('Job was cancelled by user');
      }
    }
  };

  // Update summary
  const updateSummary = async (newSummary: string) => {
    if (!activeJobId || !user?.id) return;
    
    try {
      // Update in database
      await supabase.rpc('update_job_summary', {
        p_job_id: activeJobId,
        p_summary: newSummary
      });
      
      // Update local state
      setSummary(newSummary);
      
      toast({
        title: "Summary updated",
        description: "Your changes have been saved."
      });
    } catch (error) {
      console.error('Error updating summary:', error);
      toast({
        variant: "destructive",
        title: "Failed to update",
        description: "There was a problem saving your changes."
      });
    }
  };

  // Update FAQ
  const updateFAQ = async (updatedFaq: FAQ) => {
    if (!activeJobId || !user?.id) return;
    
    try {
      // Update in database via RPC function
      await supabase.rpc('update_faq_item', {
        p_job_id: activeJobId,
        p_faq_id: updatedFaq.id,
        p_question: updatedFaq.question,
        p_answer: updatedFaq.answer,
        p_category: updatedFaq.category
      });
      
      // Update local state
      setFAQs(currentFaqs => 
        currentFaqs.map(faq => 
          faq.id === updatedFaq.id ? updatedFaq : faq
        )
      );
      
      toast({
        title: "FAQ updated",
        description: "Your changes have been saved."
      });
      
      return true;
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast({
        variant: "destructive",
        title: "Failed to update",
        description: "There was a problem saving your changes."
      });
      return false;
    }
  };

  return {
    url,
    setUrl,
    isLoading,
    isUploading,
    progress,
    stage,
    summary,
    setSummary,
    faqs,
    setFAQs,
    error,
    pageCount,
    selectedFiles,
    jobStatus,
    activeJobId,
    handleFilesSelected,
    handleSubmit,
    handleRetrain,
    handleCancelJob: onCancelJob,
    clearFiles,
    updateSummary,
    updateFAQ,
    userId: user?.id
  };
}
