
import { processRequestSync } from "./sync-processor.ts";
import { createJob } from "./jobs.ts";

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
    
    // Erstelle Jobeintrag in der Datenbank
    const createJobResult = await createJob(jobId, url || '', userId);
    console.log('Create job result:', JSON.stringify(createJobResult));
    
    // Starte Verarbeitung im Hintergrund
    try {
      // Da wir Schwierigkeiten mit der asynchronen Verarbeitung haben, verwenden wir
      // einen synchronen Ansatz für mehr Stabilität
      const processResult = await processRequestSync({ 
        url: url || '', 
        maxPages, 
        maxDepth, 
        documents 
      });
      
      console.log('Background job processing completed with result:', JSON.stringify(processResult));
      
      return {
        success: true,
        message: "Job started and processed successfully.",
        jobId,
        details: processResult
      };
    } catch (procError) {
      console.error('Error processing job in background:', procError);
      
      // Wir geben hier trotzdem Erfolg zurück, da der Job erstellt wurde
      // Die tatsächliche Fehlerbehandlung erfolgt in der Jobdatei
      return {
        success: true,
        message: "Job started, but encountered processing errors.",
        jobId,
        error: procError.message || 'Unknown processing error'
      };
    }
  } catch (error) {
    console.error('Failed to create or process job:', {
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

// Process request synchronously (original implementation)
export { processRequestSync };
