
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
      .maybeSingle(); // Changed from single() to maybeSingle() to prevent the multiple rows error
    
    if (error) {
      console.error('Error fetching job status:', error);
      throw new Error(error.message);
    }
    
    // If no data found, return appropriate message
    if (!data) {
      console.warn(`No job found with ID: ${jobId}`);
      return { 
        data: {
          status: 'failed',
          error: `Job with ID ${jobId} not found`
        }, 
        error: null 
      };
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('Error polling job status:', err);
    onError(err.message || 'Failed to fetch job status');
    throw err;
  }
}

/**
 * Create or update job status in the database
 */
export async function updateJobStatus(
  jobId: string,
  status: string,
  progress: number,
  error?: string
): Promise<boolean> {
  try {
    const updates = {
      status,
      progress,
      updatedat: new Date().toISOString()
    };
    
    if (error) {
      updates['error'] = error;
    }
    
    const { error: updateError } = await supabase
      .from('ai_training_jobs')
      .update(updates)
      .eq('jobid', jobId);
    
    if (updateError) {
      console.error('Error updating job status:', updateError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Failed to update job status:', err);
    return false;
  }
}
