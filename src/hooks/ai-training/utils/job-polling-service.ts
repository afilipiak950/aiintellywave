
import { supabase } from '@/integrations/supabase/client';
import { AITrainingJob } from '@/types/ai-training';

// Fetch job status from Supabase
export async function fetchJobStatus(
  jobId: string,
  onError: (message: string) => void
): Promise<{ data: AITrainingJob | null, error: string | null }> {
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
    
    if (!data) {
      console.warn(`No job data found for job ID: ${jobId}`);
      return { data: null, error: null };
    }

    // Validate and cast status to the expected type
    const status = data.status as string;
    if (status && !['processing', 'completed', 'failed'].includes(status)) {
      console.warn(`Invalid status found for job ${jobId}: ${status}, defaulting to 'processing'`);
      data.status = 'processing'; // Default to processing if invalid status
    } else {
      // Ensure status is one of the allowed values
      data.status = (status as 'processing' | 'completed' | 'failed') || 'processing';
    }

    console.log(`Job status data received:`, {
      status: data.status,
      progress: data.progress,
      error: data.error || 'none'
    });
    
    return { data: data as AITrainingJob, error: null };
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
): Promise<{ success: boolean, error?: string }> {
  try {
    console.log(`Updating job ${jobId} status to ${status} with progress ${progress}%${error ? ' (error: ' + error + ')' : ''}`);
    
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
    
    console.log(`Job ${jobId} status successfully updated to ${status}`);
    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error updating job status:', err);
    return { success: false, error: err.message };
  }
}

// Force job progress update to help unstick jobs
export async function forceJobProgress(
  jobId: string,
  currentProgress: number
): Promise<boolean> {
  try {
    // Increment progress by a small amount to show activity
    const newProgress = Math.min(currentProgress + 5, 95);
    
    console.log(`Forcing job ${jobId} progress update from ${currentProgress}% to ${newProgress}%`);
    
    const { error } = await supabase
      .from('ai_training_jobs')
      .update({
        progress: newProgress,
        updatedat: new Date().toISOString()
      })
      .eq('jobid', jobId);
      
    if (error) {
      console.error('Error forcing job progress update:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error forcing job progress:', err);
    return false;
  }
}

// Cancel job completely
export async function cancelJob(
  jobId: string
): Promise<boolean> {
  try {
    console.log(`Cancelling job ${jobId}`);
    
    const { error } = await supabase
      .from('ai_training_jobs')
      .update({
        status: 'failed',
        progress: 0,
        error: 'Job cancelled by user',
        updatedat: new Date().toISOString()
      })
      .eq('jobid', jobId);
      
    if (error) {
      console.error('Error cancelling job:', error);
      return false;
    }
    
    console.log(`Job ${jobId} successfully cancelled`);
    return true;
  } catch (err) {
    console.error('Unexpected error cancelling job:', err);
    return false;
  }
}
