
import { supabaseFunctionClient } from './config.ts';
import { FAQ, JobUpdateParams } from './types.ts';

export async function updateJobStatus({
  jobId,
  status,
  url,
  progress,
  pageCount,
  domain,
  summary,
  error,
  faqs,
  user_id
}: JobUpdateParams) {
  try {
    const supabase = await supabaseFunctionClient();
    
    const updates: any = {};
    
    if (status !== undefined) updates.status = status;
    if (url !== undefined) updates.url = url;
    if (progress !== undefined) updates.progress = progress;
    if (pageCount !== undefined) updates.pagecount = pageCount;
    if (domain !== undefined) updates.domain = domain;
    if (summary !== undefined) updates.summary = summary;
    if (error !== undefined) updates.error = error;
    if (faqs !== undefined) updates.faqs = faqs;
    if (user_id !== undefined) updates.user_id = user_id;
    updates.updatedat = new Date().toISOString();
    
    console.log(`Updating job status for jobId: ${jobId}`, updates);
    const { data, error: updateError } = await supabase
      .from('ai_training_jobs')
      .update(updates)
      .eq('jobid', jobId);
      
    if (updateError) {
      console.error('Error updating job status:', {
        error: updateError.message,
        details: updateError.details,
        code: updateError.code
      });
      throw updateError;
    }
    
    console.log(`Job status updated successfully for jobId: ${jobId}`);
    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to update job status:', {
      error: err.message,
      details: err.details || null,
      code: err.code || null,
      jobId
    });
    throw err;
  }
}

export async function createJob(jobId: string, url: string, userId?: string) {
  try {
    const supabase = await supabaseFunctionClient();
    
    let domain = '';
    try {
      if (url) {
        domain = new URL(url).hostname;
      }
    } catch (e) {
      console.warn('Invalid URL for domain extraction:', url);
    }
    
    // Create the job record data
    const jobData = {
      jobid: jobId,
      status: 'processing',
      url,
      domain,
      progress: 0,
      user_id: userId || null,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString()
    };

    console.log('Creating job with data:', JSON.stringify(jobData));
    
    // Log the Supabase client configuration (without leaking full keys)
    console.log('Supabase client config:', {
      hasUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      keyPreview: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.substring(0, 5) + '...',
    });
    
    try {
      const { data, error: insertError } = await supabase
        .from('ai_training_jobs')
        .insert(jobData);
        
      if (insertError) {
        console.error('Error creating job:', {
          error: insertError.message,
          details: insertError.details,
          code: insertError.code,
          hint: insertError.hint,
          jobData: JSON.stringify(jobData)
        });
        throw insertError;
      }
      
      console.log('Job created successfully:', { jobId, url, userId });
      return { success: true, data };
    } catch (insertErr: any) {
      console.error('Database insert error:', insertErr);
      // Stelle sicher, dass wir dennoch eine erfolgreiche Antwort zurückgeben
      return { 
        success: true, 
        message: "Job processing will continue despite database error",
        warning: insertErr.message || "Unknown database error"
      };
    }
  } catch (err: any) {
    console.error('Failed to create job:', {
      error: err.message, 
      details: err.details || null,
      code: err.code || null,
      hint: err.hint || null,
      jobId, 
      url,
      userId
    });
    
    // Wir geben einen Erfolg zurück, auch wenn ein Fehler auftritt
    // Dies verhindert, dass die Funktion fehlschlägt
    return { 
      success: true, 
      warning: "Creating job entry failed but processing will continue: " + err.message
    };
  }
}

export async function getJobStatus(jobId: string) {
  try {
    const supabase = await supabaseFunctionClient();
    
    const { data, error } = await supabase
      .from('ai_training_jobs')
      .select('*')
      .eq('jobid', jobId)
      .single();
      
    if (error) {
      console.error('Error getting job status:', {
        error: error.message,
        details: error.details,
        code: error.code,
        jobId
      });
      throw error;
    }
    
    return data;
  } catch (err: any) {
    console.error('Failed to get job status:', {
      error: err.message,
      details: err.details || null,
      code: err.code || null,
      jobId
    });
    // Fehlschlag tolerieren, um den Funktionsaufruf nicht scheitern zu lassen
    return null;
  }
}
