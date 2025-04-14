import { supabase } from '@/integrations/supabase/client';
import { JobStatus } from '../types';

export const fetchJobStatus = async (
  jobId: string,
  onError: (error: string) => void
) => {
  try {
    console.log(`Fetching status for job: ${jobId}`);
    
    const { data, error } = await supabase
      .from('ai_training_jobs')
      .select('*')
      .eq('jobid', jobId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching job status:', error);
      onError(`Database error: ${error.message}`);
      return { data: null, error: error.message };
    }
    
    if (!data) {
      console.warn(`No data found for job ${jobId}`);
      onError('Job not found');
      return { data: null, error: 'Job not found' };
    }
    
    console.log(`Job status: ${data.status}, progress: ${data.progress}%`);
    return { data, error: null };
  } catch (err: any) {
    console.error('Exception when fetching job status:', err);
    onError(err.message);
    return { data: null, error: err.message };
  }
};

export const updateJobStatus = async (
  jobId: string, 
  status: JobStatus,
  progress: number = 0,
  error?: string
) => {
  try {
    const updateData: any = {
      status,
      progress: progress || 0,
      updatedat: new Date().toISOString()
    };
    
    if (error) {
      updateData.error = error;
    }
    
    const { error: dbError } = await supabase
      .from('ai_training_jobs')
      .update(updateData)
      .eq('jobid', jobId);
      
    if (dbError) {
      console.error('Error updating job status:', dbError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exception when updating job status:', err);
    return false;
  }
};

export const forceJobProgress = async (
  jobId: string, 
  currentProgress: number
) => {
  try {
    // Attempt to ping the function to see if it's still running
    try {
      const heartbeatResponse = await supabase.functions.invoke('website-crawler-heartbeat', {
        body: { jobId }
      });
      
      if (heartbeatResponse.data?.alive) {
        console.log(`Job ${jobId} is still alive, heartbeat received`);
        
        // Just bump progress slightly to show movement
        const newProgress = Math.min(90, currentProgress + 5);
        await updateJobStatus(jobId, 'processing', newProgress);
        return true;
      }
    } catch (e) {
      console.warn(`Heartbeat check failed for job ${jobId}:`, e);
      // Continue with recovery logic
    }
    
    // Job seems potentially stalled, check how long it's been running
    const { data } = await supabase
      .from('ai_training_jobs')
      .select('createdat, updatedat')
      .eq('jobid', jobId)
      .single();
      
    if (data) {
      const createdAt = new Date(data.createdat).getTime();
      const updatedAt = new Date(data.updatedat).getTime();
      const now = Date.now();
      
      const minutesSinceCreation = (now - createdAt) / 1000 / 60;
      const minutesSinceUpdate = (now - updatedAt) / 1000 / 60;
      
      console.log(`Job ${jobId} metrics: ${minutesSinceCreation.toFixed(1)} minutes since creation, ${minutesSinceUpdate.toFixed(1)} minutes since last update`);
      
      // If job has been running for more than 30 minutes or no updates for 10 minutes,
      // it's probably stalled
      if (minutesSinceCreation > 30 || minutesSinceUpdate > 10) {
        console.warn(`Job ${jobId} appears stalled, marking as failed`);
        
        await updateJobStatus(
          jobId, 
          'failed', 
          0, 
          'Job processing timed out. Please try again or contact support if the issue persists.'
        );
        return true;
      }
    }
    
    // Otherwise just bump progress to show movement
    const newProgress = Math.min(95, currentProgress + 3);
    await updateJobStatus(jobId, 'processing', newProgress);
    return true;
  } catch (err) {
    console.error('Exception when forcing job progress:', err);
    return false;
  }
};

export const cancelJob = async (jobId: string) => {
  try {
    // Call a function to attempt to cancel the job at the edge function level
    try {
      await supabase.functions.invoke('website-crawler-cancel', {
        body: { jobId }
      });
    } catch (e) {
      console.warn(`Failed to invoke cancel function for job ${jobId}:`, e);
      // Continue with local cancellation
    }
    
    // Mark the job as cancelled in the database
    const { error } = await supabase
      .from('ai_training_jobs')
      .update({
        status: 'failed',
        error: 'Job cancelled by user',
        updatedat: new Date().toISOString()
      })
      .eq('jobid', jobId);
      
    if (error) {
      console.error('Error marking job as cancelled:', error);
      return false;
    }
    
    console.log(`Job ${jobId} marked as cancelled successfully`);
    return true;
  } catch (err) {
    console.error('Exception when cancelling job:', err);
    return false;
  }
};
