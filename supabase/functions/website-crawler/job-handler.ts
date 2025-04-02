
import { createJob } from "./jobs.ts";
import { processJobAsync } from "./background-processor.ts";

// Handle request to create a background job
export async function handleBackgroundJob({ jobId, url, userId, maxPages, maxDepth, documents }: {
  jobId: string;
  url?: string;
  userId?: string;
  maxPages: number;
  maxDepth: number;
  documents: any[];
}) {
  try {
    console.log(`Starting background job handler for jobId: ${jobId}`, {
      url,
      userId,
      maxPages,
      maxDepth,
      documentCount: documents?.length || 0
    });
    
    // Create job entry in the database
    const createJobResult = await createJob(jobId, url || '', userId);
    console.log('Create job result:', JSON.stringify(createJobResult));
    
    // Start processing in background
    processJobAsync({ jobId, url: url || '', userId, maxPages, maxDepth, documents });
    
    // Return success immediately while processing continues
    return {
      success: true, 
      message: "Job started. You will be notified when processing completes.",
      jobId
    };
  } catch (error) {
    console.error('Failed to create job:', {
      error: error.message, 
      details: error.details || null,
      code: error.code || null,
      hint: error.hint || null,
      jobId, 
      url,
      userId
    });
    
    return {
      success: false, 
      error: "Failed to start background job: " + error.message,
      details: error.details || null,
      code: error.code || null,
      hint: error.hint || null
    };
  }
}
