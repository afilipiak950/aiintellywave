
import { supabaseFunctionClient } from './config';
import { FAQ } from './types';

interface JobUpdateParams {
  jobId: string;
  status?: string;
  url?: string;
  progress?: number;
  pageCount?: number;
  domain?: string;
  summary?: string;
  error?: string;
  faqs?: FAQ[];
}

export async function updateJobStatus({
  jobId,
  status,
  url,
  progress,
  pageCount,
  domain,
  summary,
  error,
  faqs
}: JobUpdateParams) {
  const supabase = supabaseFunctionClient();
  
  const updates: any = {
    status
  };
  
  if (url !== undefined) updates.url = url;
  if (progress !== undefined) updates.progress = progress;
  if (pageCount !== undefined) updates.pagecount = pageCount;
  if (domain !== undefined) updates.domain = domain;
  if (summary !== undefined) updates.summary = summary;
  if (error !== undefined) updates.error = error;
  if (faqs !== undefined) updates.faqs = faqs;
  updates.updatedat = new Date().toISOString();
  
  try {
    const { error: updateError } = await supabase
      .from('ai_training_jobs')
      .update(updates)
      .eq('jobid', jobId);
      
    if (updateError) {
      console.error('Error updating job status:', updateError);
      throw updateError;
    }
    
    return { success: true };
  } catch (err) {
    console.error('Failed to update job status:', err);
    throw err;
  }
}

export async function createJob(jobId: string, url: string) {
  const supabase = supabaseFunctionClient();
  
  try {
    let domain = '';
    try {
      domain = new URL(url).hostname;
    } catch (e) {
      console.warn('Invalid URL for domain extraction:', url);
    }
    
    const { error: insertError } = await supabase
      .from('ai_training_jobs')
      .insert({
        jobid: jobId,
        status: 'processing',
        url,
        domain,
        progress: 0,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString()
      });
      
    if (insertError) {
      console.error('Error creating job:', insertError);
      throw insertError;
    }
    
    return { success: true };
  } catch (err) {
    console.error('Failed to create job:', err);
    throw err;
  }
}

export async function getJobStatus(jobId: string) {
  const supabase = supabaseFunctionClient();
  
  try {
    const { data, error } = await supabase
      .from('ai_training_jobs')
      .select('*')
      .eq('jobid', jobId)
      .single();
      
    if (error) {
      console.error('Error getting job status:', error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('Failed to get job status:', err);
    throw err;
  }
}
