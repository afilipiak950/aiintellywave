
import { crawlWebsite } from "./crawler.ts";
import { processDocumentContent } from "./documents.ts";
import { generateContentWithOpenAI } from "./openai.ts";

// Process the request synchronously
export async function processRequestSync({ url, maxPages, maxDepth, documents }: {
  url?: string;
  maxPages: number;
  maxDepth: number;
  documents: any[];
}) {
  // Step 1: Crawl the website if URL is provided
  let textContent = "";
  let pageCount = 0;
  let domain = "";
  
  if (url) {
    console.log(`Crawling website: ${url}`);
    const crawlResult = await crawlWebsite(url, maxPages, maxDepth);
    
    if (!crawlResult.success) {
      return {
        success: false,
        error: crawlResult.error || "Failed to crawl website"
      };
    }
    
    textContent = crawlResult.textContent;
    pageCount = crawlResult.pageCount;
    domain = crawlResult.domain;
  }
  
  // Step 2: Process any uploaded documents
  if (documents && documents.length > 0) {
    console.log(`Processing ${documents.length} uploaded documents`);
    const documentContent = processDocumentContent(documents);
    textContent += documentContent;
  }
  
  if (!textContent) {
    return {
      success: false,
      error: "No content to analyze. Please provide a URL or upload documents."
    };
  }
  
  // Step 3: Generate summary and FAQs with OpenAI
  console.log(`Generating content with OpenAI${domain ? ` for ${domain}` : ''}`);
  
  try {
    const { summary, faqs } = await generateContentWithOpenAI(
      textContent, 
      domain
    );
    
    // Return successful response
    return {
      success: true,
      summary,
      faqs,
      pageCount,
      domain
    };
  } catch (error) {
    console.error(`OpenAI API error: ${error.message}`);
    return {
      success: false,
      error: `Error generating AI content: ${error.message}`
    };
  }
}
