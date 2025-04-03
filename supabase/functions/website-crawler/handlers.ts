
import { processRequestSync } from "./sync-processor.ts";
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
    
    // Start processing in background with improved error handling
    try {
      await processJobAsync({ jobId, url: url || '', userId, maxPages, maxDepth, documents });
      
      // Return success immediately while processing continues
      return {
        success: true, 
        message: "Job started. You will be notified when processing completes.",
        jobId
      };
    } catch (error) {
      console.error('Error in processJobAsync:', error);
      return {
        success: false, 
        error: `Failed to start background processing: ${error.message || 'Unknown error'}`,
        details: error.details || null
      };
    }
  } catch (error) {
    console.error('Failed to handle background job:', {
      error: error.message, 
      details: error.details || null,
      stack: error.stack || null,
      jobId, 
      url,
      userId
    });
    
    return {
      success: false, 
      error: "Failed to start background job: " + error.message,
      details: error.details || null,
      stack: error.stack || null
    };
  }
}

// Process request synchronously (original implementation)
export { processRequestSync };
