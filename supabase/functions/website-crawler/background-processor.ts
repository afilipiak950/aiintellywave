
import { updateJobStatus, createJob } from "./jobs.ts";
import { crawlWebsite } from "./crawler.ts";
import { processDocumentContent } from "./documents.ts";
import { generateContentWithOpenAI } from "./openai.ts";

// Process the job asynchronously
export async function processJobAsync(params: { 
  jobId: string; 
  url: string;
  maxPages: number;
  maxDepth: number;
  documents: any[];
}) {
  const { jobId, url, maxPages, maxDepth, documents } = params;
  
  try {
    console.log(`Processing job ${jobId} asynchronously`);
    
    // Use EdgeRuntime.waitUntil to properly handle background processing
    // This allows the function to continue processing after the response is sent
    EdgeRuntime.waitUntil((async () => {
      try {
        // Update job progress
        await updateJobStatus({ 
          jobId, 
          status: 'processing', 
          progress: 5 
        });
        
        // Step 1: Crawl website if URL provided
        let textContent = "";
        let pageCount = 0;
        let domain = "";
        
        if (url) {
          console.log(`Crawling website: ${url}`);
          const crawlResult = await crawlWebsite(url, maxPages, maxDepth);
          
          if (!crawlResult.success) {
            await updateJobStatus({
              jobId,
              status: 'failed',
              error: crawlResult.error || "Failed to crawl website"
            });
            return;
          }
          
          textContent = crawlResult.textContent;
          pageCount = crawlResult.pageCount;
          domain = crawlResult.domain;
          
          await updateJobStatus({
            jobId,
            status: 'processing',
            progress: 40,
            domain,
            pageCount
          });
        }
        
        // Step 2: Process documents
        if (documents && documents.length > 0) {
          console.log(`Processing ${documents.length} uploaded documents`);
          const documentContent = processDocumentContent(documents);
          textContent += documentContent;
          
          await updateJobStatus({
            jobId,
            status: 'processing',
            progress: 60
          });
        }
        
        // No content to analyze
        if (!textContent) {
          await updateJobStatus({
            jobId,
            status: 'failed',
            error: "No content to analyze"
          });
          return;
        }
        
        // Step 3: Generate content with OpenAI
        await updateJobStatus({
          jobId,
          status: 'processing',
          progress: 70,
        });
        
        console.log(`Generating content with OpenAI${domain ? ` for ${domain}` : ''}`);
        
        try {
          const { summary, faqs } = await generateContentWithOpenAI(textContent, domain);
          
          // Update job with results
          await updateJobStatus({
            jobId,
            status: 'completed',
            progress: 100,
            summary,
            faqs,
            pageCount,
            domain
          });
          
          console.log(`Job ${jobId} completed successfully`);
        } catch (error) {
          console.error(`OpenAI error: ${error.message}`);
          await updateJobStatus({
            jobId,
            status: 'failed',
            error: `Error generating AI content: ${error.message}`
          });
        }
      } catch (error) {
        console.error(`Background job error: ${error.message}`);
        try {
          await updateJobStatus({
            jobId,
            status: 'failed',
            error: error.message
          });
        } catch (updateError) {
          console.error('Failed to update job status after error:', updateError);
        }
      }
    })());
    
    return true;
  } catch (error) {
    console.error(`Background job error: ${error.message}`);
    try {
      await updateJobStatus({
        jobId,
        status: 'failed',
        error: error.message
      });
    } catch (updateError) {
      console.error('Failed to update job status after error:', updateError);
    }
    return false;
  }
}
