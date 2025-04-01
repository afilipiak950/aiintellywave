
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch job status from the database
 */
export async function fetchJobStatus(
  jobId: string,
  onError: (message: string) => void
): Promise<any> {
  try {
    // Check if the job exists in the database
    const { data, error } = await supabase
      .from('ai_training_jobs')
      .select('*')
      .eq('jobid', jobId)
      .single();
    
    if (error) {
      console.error('Error fetching job status:', error);
      throw new Error(error.message);
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('Error polling job status:', err);
    onError(err.message);
    throw err;
  }
}
