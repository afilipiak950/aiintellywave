
import { updateJobStatus } from "./jobs.ts";
import { crawlWebsite } from "./crawler.ts";
import { processDocumentContent } from "./documents.ts";
import { generateContentWithOpenAI } from "./openai.ts";
import { generateFaqs } from "./openai/generate-faqs.ts";

// Process the job asynchronously
export async function processJobAsync(params: { 
  jobId: string; 
  url: string;
  userId?: string;
  maxPages: number;
  maxDepth: number;
  documents: any[];
}) {
  const { jobId, url, userId, maxPages, maxDepth, documents } = params;
  
  try {
    console.log(`[START] Processing job ${jobId} asynchronously for user ${userId || 'unknown'}`);
    
    // Use EdgeRuntime.waitUntil to properly handle background processing
    EdgeRuntime.waitUntil((async () => {
      try {
        // Track job start time for timeout monitoring
        const jobStartTime = Date.now();
        const MAX_JOB_DURATION_MS = 30 * 60 * 1000; // 30 minutes maximum processing time
        
        // Setup periodic progress updates to prevent job appearing stuck
        const progressInterval = setInterval(async () => {
          try {
            const elapsedTime = Date.now() - jobStartTime;
            
            // Check if job has been running too long
            if (elapsedTime > MAX_JOB_DURATION_MS) {
              console.error(`[TIMEOUT] Job ${jobId} has exceeded maximum duration of 30 minutes`);
              clearInterval(progressInterval);
              
              await updateJobStatus({
                jobId,
                status: 'failed',
                error: 'Processing timeout: Job took too long to complete',
                progress: 0,
                user_id: userId
              });
              return;
            }
            
            // Get current job status
            const { data } = await fetch(`https://database.supabase.co/rest/v1/ai_training_jobs?jobid=eq.${jobId}`, {
              headers: {
                "Content-Type": "application/json",
                "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
              }
            }).then(r => r.json());
            
            // Only update if job is still processing
            if (data?.[0]?.status === 'processing') {
              const currentProgress = data[0].progress || 0;
              
              // Send heartbeat update to prevent job from appearing stuck
              if (currentProgress < 95) {
                await updateJobStatus({
                  jobId,
                  status: 'processing',
                  progress: currentProgress + 1 > 90 ? 90 : currentProgress + 1,
                  user_id: userId
                });
              }
            } else if (data?.[0]?.status !== 'processing') {
              // Job is no longer processing, stop heartbeat
              clearInterval(progressInterval);
            }
          } catch (e) {
            console.error(`[HEARTBEAT ERROR] Failed to update job progress: ${e.message}`);
          }
        }, 60000); // Update progress every minute
        
        // Initialize job progress
        await updateJobStatus({ 
          jobId, 
          status: 'processing', 
          progress: 5,
          user_id: userId
        });
        
        console.log(`[STEP 1] Starting content collection for job ${jobId}`);
        
        // Step 1: Crawl website if URL provided
        let textContent = "";
        let pageCount = 0;
        let domain = "";
        
        if (url) {
          console.log(`[CRAWL] Starting website crawl: ${url} for job ${jobId}`);
          
          try {
            // Use a timeout for the crawler to prevent infinite hanging
            const crawlPromise = crawlWebsite(url, maxPages, maxDepth);
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error("Crawling timeout: Process took too long")), 15 * 60 * 1000); // 15 minute timeout
            });
            
            const crawlResult = await Promise.race([crawlPromise, timeoutPromise]) as any;
            
            if (!crawlResult.success) {
              console.error(`[CRAWL ERROR] Failed to crawl website: ${crawlResult.error}`);
              
              // Clear progress interval
              clearInterval(progressInterval);
              
              await updateJobStatus({
                jobId,
                status: 'failed',
                error: crawlResult.error || "Failed to crawl website",
                progress: 0,
                user_id: userId
              });
              return;
            }
            
            textContent = crawlResult.textContent;
            pageCount = crawlResult.pageCount;
            domain = crawlResult.domain;
            
            console.log(`[CRAWL SUCCESS] Completed crawling ${pageCount} pages from ${domain}`);
            
            await updateJobStatus({
              jobId,
              status: 'processing',
              progress: 40,
              domain,
              pageCount,
              user_id: userId
            });
          } catch (crawlError) {
            console.error(`[CRAWL FATAL] Unexpected error during crawl: ${crawlError.message}`);
            
            // Clear progress interval
            clearInterval(progressInterval);
            
            await updateJobStatus({
              jobId,
              status: 'failed',
              error: `Crawling error: ${crawlError.message}`,
              progress: 0,
              user_id: userId
            });
            return;
          }
        }
        
        // Step 2: Process documents
        if (documents && documents.length > 0) {
          console.log(`[DOCS] Processing ${documents.length} uploaded documents for job ${jobId}`);
          try {
            const documentContent = processDocumentContent(documents);
            textContent += documentContent;
            
            await updateJobStatus({
              jobId,
              status: 'processing',
              progress: 60,
              user_id: userId
            });
          } catch (docsError) {
            console.error(`[DOCS ERROR] Error processing documents: ${docsError.message}`);
            
            // Clear progress interval
            clearInterval(progressInterval);
            
            await updateJobStatus({
              jobId,
              status: 'failed',
              error: `Document processing error: ${docsError.message}`,
              progress: 0,
              user_id: userId
            });
            return;
          }
        }
        
        // No content to analyze
        if (!textContent) {
          console.error(`[CONTENT ERROR] No content to analyze for job ${jobId}`);
          
          // Clear progress interval
          clearInterval(progressInterval);
          
          await updateJobStatus({
            jobId,
            status: 'failed',
            error: "No content to analyze. Please provide a valid URL or upload documents.",
            user_id: userId
          });
          return;
        }
        
        // Step 3: Generate summary with OpenAI
        await updateJobStatus({
          jobId,
          status: 'processing',
          progress: 70,
          user_id: userId
        });
        
        console.log(`[AI] Generating AI content for job ${jobId} - text length: ${textContent.length}`);
        
        try {
          console.log(`[AI REQUEST] Sending content to OpenAI API for job ${jobId}`);
          
          // Generate summary
          const { summary } = await generateContentWithOpenAI(textContent, domain);
          
          // Update progress to show we're generating FAQs now
          await updateJobStatus({
            jobId,
            status: 'processing',
            progress: 85,
            summary,
            user_id: userId
          });
          
          // Generate exactly 100 FAQs in a separate call
          console.log(`[AI REQUEST] Generating 100 FAQs for job ${jobId}`);
          const faqs = await generateFaqs(textContent, domain);
          
          console.log(`[AI SUCCESS] Received AI content for job ${jobId}: ${faqs.length} FAQs`);
          
          // Update job with results
          await updateJobStatus({
            jobId,
            status: 'completed',
            progress: 100,
            summary,
            faqs,
            pageCount,
            domain,
            user_id: userId
          });
          
          // Clear progress interval
          clearInterval(progressInterval);
          
          console.log(`[COMPLETE] Job ${jobId} completed successfully`);
        } catch (aiError) {
          console.error(`[AI ERROR] OpenAI error for job ${jobId}: ${aiError.message}`);
          
          // Clear progress interval
          clearInterval(progressInterval);
          
          await updateJobStatus({
            jobId,
            status: 'failed',
            error: `Error generating AI content: ${aiError.message}`,
            user_id: userId
          });
        }
      } catch (error) {
        console.error(`[FATAL] Background job error for job ${jobId}: ${error.message}`);
        try {
          await updateJobStatus({
            jobId,
            status: 'failed',
            error: `Fatal error: ${error.message}`,
            user_id: userId
          });
        } catch (updateError) {
          console.error(`[DATABASE ERROR] Failed to update job status after error: ${updateError.message}`);
        }
      }
    })());
    
    return true;
  } catch (error) {
    console.error(`[INITIALIZATION ERROR] Failed to start background job ${jobId}: ${error.message}`);
    try {
      await updateJobStatus({
        jobId,
        status: 'failed',
        error: `Failed to start job: ${error.message}`,
        user_id: userId
      });
    } catch (updateError) {
      console.error(`[DATABASE ERROR] Failed to update job status after error: ${updateError.message}`);
    }
    return false;
  }
}
