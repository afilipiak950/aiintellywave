
import { updateJobStatus } from "./jobs.ts";
import { crawlWebsite } from "./crawler.ts";
import { processDocumentContent } from "./documents.ts";
import { generateContentWithOpenAI } from "./openai.ts";

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
            const crawlResult = await crawlWebsite(url, maxPages, maxDepth);
            
            if (!crawlResult.success) {
              console.error(`[CRAWL ERROR] Failed to crawl website: ${crawlResult.error}`);
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
          await updateJobStatus({
            jobId,
            status: 'failed',
            error: "No content to analyze. Please provide a valid URL or upload documents.",
            user_id: userId
          });
          return;
        }
        
        // Step 3: Generate content with OpenAI
        await updateJobStatus({
          jobId,
          status: 'processing',
          progress: 70,
          user_id: userId
        });
        
        console.log(`[AI] Generating AI content for job ${jobId} - text length: ${textContent.length}`);
        
        try {
          console.log(`[AI REQUEST] Sending content to OpenAI API for job ${jobId}`);
          const { summary, faqs } = await generateContentWithOpenAI(textContent, domain);
          console.log(`[AI SUCCESS] Received AI content for job ${jobId}`);
          
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
          
          console.log(`[COMPLETE] Job ${jobId} completed successfully`);
        } catch (aiError) {
          console.error(`[AI ERROR] OpenAI error for job ${jobId}: ${aiError.message}`);
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
