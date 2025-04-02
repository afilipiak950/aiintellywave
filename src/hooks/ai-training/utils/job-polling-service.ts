
import { supabase } from '@/integrations/supabase/client';

// Fetch job status from Supabase
export async function fetchJobStatus(
  jobId: string,
  onError: (message: string) => void
) {
  try {
    console.log(`Fetching job status for job ID: ${jobId}`);
    const { data, error } = await supabase
      .from('ai_training_jobs')
      .select('*')
      .eq('jobid', jobId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching job status:', error);
      onError(error.message);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('Unexpected error fetching job status:', err);
    onError(err.message);
    return { data: null, error: err.message };
  }
}

// Update job status in Supabase
export async function updateJobStatus(
  jobId: string,
  status: 'processing' | 'completed' | 'failed',
  progress: number = 0,
  error?: string
) {
  try {
    const { error: updateError } = await supabase
      .from('ai_training_jobs')
      .update({
        status,
        progress,
        error: error || null,
        updatedat: new Date().toISOString()
      })
      .eq('jobid', jobId);
      
    if (updateError) {
      console.error('Error updating job status:', updateError);
      return { success: false, error: updateError.message };
    }
    
    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error updating job status:', err);
    return { success: false, error: err.message };
  }
}
