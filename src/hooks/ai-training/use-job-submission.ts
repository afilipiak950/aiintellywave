
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileContent } from './types';

export function useJobSubmission() {
  const { toast } = useToast();

  const submitJob = async (
    websiteUrl: string,
    documentData: FileContent[] | null,
    userId: string | undefined,
    setIsLoading: (isLoading: boolean) => void,
    setError: (error: string | null) => void,
    setSummary: (summary: string) => void,
    setFAQs: (faqs: any[]) => void,
    setPageCount: (count: number) => void,
    setActiveJobId: (id: string | null) => void,
    setJobStatus: (status: 'idle' | 'processing' | 'completed' | 'failed') => void
  ) => {
    // Declare jobId at the function level so it's accessible in all blocks
    let jobId: string;
    
    try {
      // Validate input - require either a website URL or documents
      if (!websiteUrl && (!documentData || documentData.length === 0)) {
        throw new Error("Please provide either a website URL or upload documents to analyze");
      }

      // Validate user ID
      if (!userId) {
        throw new Error("User authentication is required");
      }

      setIsLoading(true);
      setError(null);
      setSummary('');
      setFAQs([]);
      setPageCount(0);
      
      // Initialize jobId
      jobId = uuidv4();
      setActiveJobId(jobId);
      setJobStatus('processing');
      
      // Prepare domain from URL if available
      let domain = '';
      try {
        if (websiteUrl) {
          domain = new URL(websiteUrl).hostname;
        }
      } catch (err) {
        console.warn('Invalid URL format:', err);
        // Continue anyway, the URL will be processed by the backend
      }
      
      // Create job entry in database first to ensure it exists
      try {
        // Check if a job with this ID already exists (should never happen with UUID but just in case)
        const { data: existingJob } = await supabase
          .from('ai_training_jobs')
          .select('jobid')
          .eq('jobid', jobId)
          .maybeSingle();
          
        if (existingJob) {
          console.warn('Job ID collision detected, generating new ID');
          jobId = uuidv4(); // Now we can reassign it without errors
          setActiveJobId(jobId);
        }
        
        const { error: dbError } = await supabase
          .from('ai_training_jobs')
          .insert({
            jobid: jobId,
            status: 'processing',
            url: websiteUrl || '',
            domain: domain,
            progress: 0,
            user_id: userId,
            updatedat: new Date().toISOString(),
            createdat: new Date().toISOString()
          });
          
        if (dbError) {
          console.error('Error creating job record:', dbError);
          throw new Error(`Failed to initialize job in database: ${dbError.message}`);
        }
      } catch (dbErr: any) {
        console.error('Database operation failed:', dbErr);
        throw new Error(`Database error: ${dbErr.message}`);
      }
      
      console.log(`Invoking website-crawler function with jobId: ${jobId}`);
      
      const response = await supabase.functions.invoke('website-crawler', {
        body: {
          jobId,
          url: websiteUrl || '',
          userId,
          maxPages: 30,
          maxDepth: 2,
          documents: documentData || [],
          background: true
        }
      });
      
      // Check for function errors
      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(response.error.message || 'Failed to start processing job');
      }
      
      // Check for non-success response
      if (response.data && !response.data.success) {
        console.error('Function returned error:', response.data.error);
        throw new Error(response.data.error || 'Function returned an error');
      }
      
      toast({
        title: "Processing Started",
        description: "Your request is being processed in the background. You can leave this page and come back later.",
      });
      
      console.log('Job submission successful, background processing started');
      
    } catch (err: any) {
      console.error('Error during website analysis:', err);
      setError(err.message || 'Failed to analyze. Please try again.');
      setIsLoading(false);
      
      // Update job status in database if we have a jobId
      try {
        // Now jobId will be accessible here because it's defined at the function level
        if (jobId) {
          await supabase
            .from('ai_training_jobs')
            .update({ 
              status: 'failed',
              error: err.message || 'Unknown error occurred',
              updatedat: new Date().toISOString()
            })
            .eq('jobid', jobId);
        }
        
        // Reset activeJobId on error
        setActiveJobId(null);
      } catch (dbErr) {
        console.error('Failed to update job status:', dbErr);
      }
      
      setJobStatus('failed');
      
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to analyze the website",
      });
      
      throw err;
    }
  };

  return { submitJob };
}
