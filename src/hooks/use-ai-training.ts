
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AITrainingJob, parseFaqs } from '@/types/ai-training';
import { FAQ } from '@/components/train-ai/FAQAccordion';

export function useAITraining() {
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
  const [jobStatus, setJobStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
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
  }, [toast]);

  // Poll for job status updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    const fetchJobStatus = async () => {
      if (!activeJobId) return;
      
      try {
        const { data, error } = await supabase
          .from('ai_training_jobs')
          .select('*')
          .eq('jobid', activeJobId)
          .single();
        
        if (error) {
          console.error('Error fetching job status:', error);
          return;
        }
        
        if (data) {
          setJobStatus(data.status as 'idle' | 'processing' | 'completed' | 'failed');
          
          if (data.status === 'completed') {
            setProgress(100);
            setSummary(data.summary || '');
            setFAQs(parseFaqs(data.faqs));
            setPageCount(data.pagecount || 0);
            setUrl(data.url || '');
            setIsLoading(false);
            
            toast({
              title: "Analysis Complete",
              description: `Successfully analyzed ${data.domain || new URL(data.url).hostname}`,
            });
            
            if (interval) clearInterval(interval);
          } else if (data.status === 'failed') {
            setError(data.error || 'Job processing failed');
            setIsLoading(false);
            
            toast({
              variant: "destructive",
              title: "Error",
              description: data.error || "Processing failed",
            });
            
            if (interval) clearInterval(interval);
          } else if (data.status === 'processing') {
            if (data.progress) {
              setProgress(data.progress);
              if (data.progress < 30) {
                setStage('Crawling Website');
              } else if (data.progress < 60) {
                setStage('Analyzing Content');
              } else if (data.progress < 85) {
                setStage('Generating AI Summary');
              } else {
                setStage('Creating FAQs');
              }
            }
          }
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    };
    
    if (activeJobId && jobStatus === 'processing') {
      interval = setInterval(fetchJobStatus, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeJobId, jobStatus, toast]);

  // Simulate progress when loading
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isLoading && !activeJobId) {
      setProgress(0);
      
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          const increment = prevProgress < 30 ? 1 : 
                          prevProgress < 60 ? 0.7 : 
                          prevProgress < 85 ? 0.4 : 0.2;
                          
          const newProgress = prevProgress + increment;
          
          if (newProgress < 30) {
            setStage('Crawling Website');
          } else if (newProgress < 60) {
            setStage('Analyzing Content');
          } else if (newProgress < 85) {
            setStage('Generating AI Summary');
          } else {
            setStage('Creating FAQs');
          }
          
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 200);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, activeJobId]);

  // Handle file selection
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
  };

  // Read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error(`Error reading file: ${file.name}`));
      };
      
      if (file.type.includes('pdf')) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  // Upload and process files
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return null;
    
    setIsUploading(true);
    const fileContents: { name: string; content: string; type: string }[] = [];
    
    try {
      for (const file of selectedFiles) {
        const content = await readFileContent(file);
        fileContents.push({
          name: file.name,
          content,
          type: file.type
        });
      }
      setIsUploading(false);
      return fileContents;
    } catch (err: any) {
      setIsUploading(false);
      setError(`Error reading files: ${err.message}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to process documents: ${err.message}`,
      });
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (websiteUrl: string) => {
    try {
      if (websiteUrl) {
        setUrl(websiteUrl);
      } else if (!selectedFiles.length) {
        throw new Error('Please enter a URL or upload documents');
      }
      
      setIsLoading(true);
      setError(null);
      setSummary('');
      setFAQs([]);
      setPageCount(0);
      
      const documentData = await uploadFiles();
      
      const jobId = uuidv4();
      setActiveJobId(jobId);
      setJobStatus('processing');
      
      const response = await supabase.functions.invoke('website-crawler', {
        body: {
          jobId,
          url: websiteUrl || '',
          maxPages: 30,
          maxDepth: 2,
          documents: documentData || [],
          background: true
        }
      });
      
      // Check for function errors
      if (response.error) {
        throw new Error(response.error.message || 'Failed to start processing job');
      }
      
      // Check for non-success response
      if (response.data && !response.data.success) {
        throw new Error(response.data.error || 'Function returned an error');
      }
      
      toast({
        title: "Processing Started",
        description: "Your request is being processed in the background. You can leave this page and come back later.",
      });
      
    } catch (err: any) {
      console.error('Error during website analysis:', err);
      setError(err.message || 'Failed to analyze. Please try again.');
      setIsLoading(false);
      setActiveJobId(null);
      setJobStatus('failed');
      
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to analyze the website",
      });
    }
  };

  // Retrain function
  const handleRetrain = () => {
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
    handleRetrain
  };
}
