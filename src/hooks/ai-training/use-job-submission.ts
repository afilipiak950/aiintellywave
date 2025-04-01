
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileContent } from './types';

export function useJobSubmission() {
  const { toast } = useToast();

  const submitJob = async (
    websiteUrl: string,
    documentData: FileContent[] | null,
    setIsLoading: (isLoading: boolean) => void,
    setError: (error: string | null) => void,
    setSummary: (summary: string) => void,
    setFAQs: (faqs: any[]) => void,
    setPageCount: (count: number) => void,
    setActiveJobId: (id: string | null) => void,
    setJobStatus: (status: 'idle' | 'processing' | 'completed' | 'failed') => void
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setSummary('');
      setFAQs([]);
      setPageCount(0);
      
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
      
      throw err;
    }
  };

  return { submitJob };
}
