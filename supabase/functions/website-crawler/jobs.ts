
import { supabaseFunctionClient } from "./config.ts";
import { crawlWebsite } from "./crawler.ts";
import { processDocumentContent } from "./documents.ts";
import { generateContentWithOpenAI } from "./openai.ts";

// Types
export interface JobData {
  jobId: string;
  url: string;
  maxPages: number;
  maxDepth: number;
  documents: any[];
}

// Update job status in the database
export async function updateJobStatus(jobId: string, status: 'processing' | 'completed' | 'failed', data: any = {}) {
  try {
    const { error } = await supabaseFunctionClient()
      .from('ai_training_jobs')
      .upsert({
        jobId,
        status,
        updatedAt: new Date().toISOString(),
        ...data
      });
      
    if (error) {
      console.error(`Error updating job status: ${error.message}`);
    }
  } catch (error: any) {
    console.error(`Failed to update job status: ${error.message}`);
  }
}

// Process job in the background
export async function processJobInBackground(jobData: JobData) {
  const { jobId, url, maxPages, maxDepth, documents = [] } = jobData;
  console.log(`Starting background job ${jobId} for ${url}`);
  
  try {
    // Create initial job entry
    await updateJobStatus(jobId, 'processing', { 
      url,
      progress: 10,
      createdAt: new Date().toISOString()
    });
    
    let textContent = "";
    let pageCount = 0;
    let domain = "";
    
    // If URL is provided, crawl the website
    if (url) {
      const crawlResult = await crawlWebsite(url, maxPages, maxDepth);
      
      if (!crawlResult.success) {
        await updateJobStatus(jobId, 'failed', { error: crawlResult.error });
        return;
      }
      
      textContent = crawlResult.textContent;
      pageCount = crawlResult.pageCount;
      domain = crawlResult.domain;
      
      await updateJobStatus(jobId, 'processing', { 
        progress: 40,
        pageCount,
        domain
      });
    }
    
    // Process any uploaded documents
    if (documents && documents.length > 0) {
      console.log(`Processing ${documents.length} uploaded documents`);
      const documentContent = processDocumentContent(documents);
      textContent += documentContent;
      
      await updateJobStatus(jobId, 'processing', { 
        progress: 60
      });
    }
    
    if (!textContent) {
      await updateJobStatus(jobId, 'failed', { 
        error: "No content to analyze. Please provide a URL or upload documents."
      });
      return;
    }
    
    // Generate summary and FAQs
    console.log(`Generating content for job ${jobId}`);
    const { summary, faqs } = await generateContentWithOpenAI(textContent, domain);
    
    // Update job with completed status and results
    await updateJobStatus(jobId, 'completed', {
      summary,
      faqs,
      pageCount,
      domain,
      progress: 100
    });
    
    console.log(`Background job ${jobId} completed successfully`);
  } catch (error: any) {
    console.error(`Error in background job ${jobId}: ${error.message}`);
    await updateJobStatus(jobId, 'failed', { error: error.message });
  }
}
