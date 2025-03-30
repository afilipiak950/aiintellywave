
import React, { useState, useEffect } from 'react';
import { AnimatedCircuitBackground } from '../../components/train-ai/AnimatedCircuitBackground';
import { TrainAIHeader } from '../../components/train-ai/TrainAIHeader';
import { UrlInputForm } from '../../components/train-ai/UrlInputForm';
import { LoadingAnimation } from '../../components/train-ai/LoadingAnimation';
import { AISummary } from '../../components/train-ai/AISummary';
import { FAQAccordion, FAQ } from '../../components/train-ai/FAQAccordion';
import { DocumentUpload } from '../../components/train-ai/DocumentUpload';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from 'uuid';

interface ProcessingJob {
  jobId: string;
  url: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  pageCount?: number;
  domain?: string;
  summary?: string;
  faqs?: FAQ[];
  error?: string;
}

const TrainAIPage: React.FC = () => {
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
  
  // Poll for job status when there's an active job
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    const fetchJobStatus = async () => {
      if (!activeJobId) return;
      
      try {
        const { data, error } = await supabase
          .from('ai_training_jobs')
          .select('*')
          .eq('jobId', activeJobId)
          .single();
        
        if (error) {
          console.error('Error fetching job status:', error);
          return;
        }
        
        if (data) {
          setJobStatus(data.status);
          
          if (data.status === 'completed') {
            setProgress(100);
            setSummary(data.summary || '');
            setFAQs(data.faqs || []);
            setPageCount(data.pageCount || 0);
            setUrl(data.url || '');
            setIsLoading(false);
            
            toast({
              title: "Analysis Complete",
              description: `Successfully analyzed ${data.domain || new URL(data.url).hostname}`,
            });
            
            // Clear the interval once the job is completed
            if (interval) clearInterval(interval);
          } else if (data.status === 'failed') {
            setError(data.error || 'Job processing failed');
            setIsLoading(false);
            
            toast({
              variant: "destructive",
              title: "Error",
              description: data.error || "Processing failed",
            });
            
            // Clear the interval once the job fails
            if (interval) clearInterval(interval);
          } else if (data.status === 'processing') {
            // Update progress based on processing stage
            if (data.progress) {
              setProgress(data.progress);
              // Update stage based on progress
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
      // Poll every 3 seconds
      interval = setInterval(fetchJobStatus, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeJobId, jobStatus, toast]);
  
  // Check for any active jobs on component mount
  useEffect(() => {
    const checkForActiveJobs = async () => {
      try {
        // Get the most recent job
        const { data, error } = await supabase
          .from('ai_training_jobs')
          .select('*')
          .order('createdAt', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error checking for active jobs:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const latestJob = data[0];
          
          // If there's an active job or completed job, load its data
          if (latestJob.status === 'processing') {
            setActiveJobId(latestJob.jobId);
            setJobStatus('processing');
            setIsLoading(true);
            setUrl(latestJob.url || '');
            
            toast({
              title: "Processing In Progress",
              description: "Your previous analysis is still being processed",
            });
          } else if (latestJob.status === 'completed') {
            setActiveJobId(latestJob.jobId);
            setJobStatus('completed');
            setSummary(latestJob.summary || '');
            setFAQs(latestJob.faqs || []);
            setPageCount(latestJob.pageCount || 0);
            setUrl(latestJob.url || '');
          }
        }
      } catch (err) {
        console.error('Error checking for active jobs:', err);
      }
    };
    
    checkForActiveJobs();
  }, [toast]);
  
  // Effect to simulate progress updates while loading
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isLoading && !activeJobId) {
      // Start at 0 progress
      setProgress(0);
      
      // Update progress every 200ms
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          // Slow down the progress as we approach higher values
          // This gives a more realistic appearance of a process that might take longer
          const increment = prevProgress < 30 ? 1 : 
                          prevProgress < 60 ? 0.7 : 
                          prevProgress < 85 ? 0.4 : 0.2;
                          
          const newProgress = prevProgress + increment;
          
          // Update loading stage based on progress
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
  
  // Process and upload files
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
  
  // Read file content as text
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
        // For PDFs, we'll send the raw binary data to the server
        // The server will use a PDF extraction library
        reader.readAsBinaryString(file);
      } else {
        // For text-based files
        reader.readAsText(file);
      }
    });
  };

  const handleSubmit = async (websiteUrl: string) => {
    try {
      // Validate URL if provided
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
      
      // Upload any selected files
      const documentData = await uploadFiles();
      
      // Generate a unique job ID
      const jobId = uuidv4();
      setActiveJobId(jobId);
      setJobStatus('processing');
      
      // Start the background job
      const { error: jobError } = await supabase.functions.invoke('website-crawler', {
        body: {
          jobId,
          url: websiteUrl || '',
          maxPages: 30,
          maxDepth: 2,
          documents: documentData || [],
          background: true
        }
      });
      
      if (jobError) {
        throw new Error(jobError.message || 'Failed to start processing job');
      }
      
      toast({
        title: "Processing Started",
        description: "Your request is being processed in the background. You can leave this page and come back later.",
      });
      
    } catch (err: any) {
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
  
  const handleRetrain = () => {
    // Start retraining with the same URL and/or any new documents
    handleSubmit(url);
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 relative">
      {/* Animated background */}
      <AnimatedCircuitBackground />
      
      {/* Content */}
      <div className="relative z-10">
        <TrainAIHeader />
        
        <UrlInputForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading || isUploading} 
        />
        
        {/* Document upload component */}
        <DocumentUpload
          onFilesSelected={handleFilesSelected}
          isProcessing={isLoading || isUploading}
        />
        
        <AnimatePresence>
          {/* Loading animation */}
          {isLoading && (
            <LoadingAnimation 
              progress={progress}
              stage={stage} 
            />
          )}
          
          {/* Error message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg mb-8"
            >
              <AlertCircle size={20} />
              <p>{error}</p>
            </motion.div>
          )}
          
          {/* Results: Summary and FAQs */}
          {!isLoading && summary && (
            <>
              {jobStatus === 'processing' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 mb-6 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="h-4 w-4 bg-blue-500 rounded-full animate-ping absolute" />
                      <div className="h-4 w-4 bg-blue-500 rounded-full relative" />
                    </div>
                    <p>FAQ generation still in progress. Check back in a few minutes for the complete results.</p>
                  </div>
                </motion.div>
              )}
              
              {jobStatus === 'completed' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 mb-6 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <p>Analysis completed successfully!</p>
                  </div>
                </motion.div>
              )}
              
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  onClick={handleRetrain}
                  disabled={isLoading || isUploading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                  {isLoading ? "Processing..." : "Retrain AI"}
                </Button>
              </div>
              
              <AISummary summary={summary} url={url} />
              {faqs.length > 0 && <FAQAccordion faqs={faqs} />}
              {pageCount > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4"
                >
                  Analysis based on {pageCount} crawled pages and {selectedFiles.length} uploaded documents
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrainAIPage;
