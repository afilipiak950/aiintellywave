
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Fetching content from: ${url}`);
    
    // Ensure URL has protocol
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    
    try {
      // Fetch with timeout and browser-like headers for job sites like stepstone.de
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000); // Increase timeout for complex sites
      
      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      }).finally(() => clearTimeout(timeout));
      
      if (!response.ok) {
        console.error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        
        // For 403 errors (common with job sites), try with a different approach
        if (response.status === 403 || response.status === 429) {
          console.log("Access denied, trying alternative approach for job sites...");
          
          // Try to use a different user agent
          const altResponse = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15',
              'Accept': 'text/html,application/xhtml+xml,application/xml',
              'Accept-Language': 'de-DE,de;q=0.9',
              'Referer': 'https://www.google.com/'
            }
          });
          
          if (!altResponse.ok) {
            throw new Error(`Still failed with alternative approach: ${altResponse.status}`);
          }
          
          const html = await altResponse.text();
          const extractedText = extractJobListing(html, targetUrl);
          
          console.log(`Successfully extracted text with alternative approach, length: ${extractedText.length}`);
          
          // Try to extract the domain for better context
          let domain = '';
          try {
            domain = new URL(targetUrl).hostname;
          } catch (e) {
            console.error('Error parsing URL domain:', e);
          }
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              text: extractedText,
              domain,
              url: targetUrl
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }
      
      // Check content type to make sure it's HTML
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        throw new Error(`URL does not appear to be an HTML page: ${contentType}`);
      }
      
      const html = await response.text();
      
      console.log(`Successfully fetched HTML content, length: ${html.length}`);
      
      // Extract text from HTML with special handling for job listings
      const extractedText = extractJobListing(html, targetUrl);
      
      console.log(`Extracted job listing text, length: ${extractedText.length}`);
      
      // Try to extract the domain for better context
      let domain = '';
      try {
        domain = new URL(targetUrl).hostname;
      } catch (e) {
        console.error('Error parsing URL domain:', e);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          text: extractedText,
          domain,
          url: targetUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (fetchError) {
      console.error('Error fetching URL:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: `Error fetching URL: ${fetchError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ success: false, error: `Server error: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Specialized function to extract job listing content
function extractJobListing(html: string, url: string): string {
  // First try the general extraction
  let text = extractTextFromHtml(html);
  
  // Check if the URL contains job site indicators
  const isJobSite = /stepstone|monster|indeed|linkedin\.com\/jobs|xing\.com\/jobs|jobware|stellenangebote|karriere/i.test(url);
  
  if (isJobSite) {
    console.log("Detected job listing site, applying specialized extraction...");
    
    // Extract structured job data from the HTML
    const jobData = extractJobData(html, url);
    
    // If we found structured job data, prioritize it
    if (jobData && Object.keys(jobData).length > 0) {
      let structuredText = "";
      
      if (jobData.title) {
        structuredText += `Job Title: ${jobData.title}\n\n`;
      }
      
      if (jobData.company) {
        structuredText += `Company: ${jobData.company}\n\n`;
      }
      
      if (jobData.location) {
        structuredText += `Location: ${jobData.location}\n\n`;
      }
      
      if (jobData.description) {
        structuredText += `Job Description:\n${jobData.description}\n\n`;
      }
      
      if (jobData.requirements) {
        structuredText += `Requirements:\n${jobData.requirements}\n\n`;
      }
      
      if (jobData.qualifications) {
        structuredText += `Qualifications:\n${jobData.qualifications}\n\n`;
      }
      
      if (jobData.responsibilities) {
        structuredText += `Responsibilities:\n${jobData.responsibilities}\n\n`;
      }
      
      // Only use the structured extraction if it seems meaningful
      if (structuredText.length > 200) {
        return structuredText;
      }
    }
    
    // Apply specialized job listing extraction if structured data isn't sufficient
    const jobSections = extractJobSections(html);
    if (jobSections.length > 0) {
      return jobSections.join("\n\n") + "\n\n" + text;
    }
  }
  
  return text;
}

// Extract structured job data from HTML
function extractJobData(html: string, url: string): any {
  const data: any = {};
  
  // Try to extract job title
  const titleMatches = html.match(/<h1[^>]*>(.*?)<\/h1>/i) || 
                      html.match(/<title[^>]*>(.*?)<\/title>/i) ||
                      html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
  
  if (titleMatches && titleMatches[1]) {
    data.title = titleMatches[1].replace(/<[^>]+>/g, '').trim();
  }
  
  // Try to extract company name
  const companyMatches = html.match(/<span[^>]*class="[^"]*company[^"]*"[^>]*>(.*?)<\/span>/i) ||
                        html.match(/<div[^>]*class="[^"]*company[^"]*"[^>]*>(.*?)<\/div>/i) ||
                        html.match(/<meta\s+property="og:site_name"\s+content="([^"]+)"/i);
  
  if (companyMatches && companyMatches[1]) {
    data.company = companyMatches[1].replace(/<[^>]+>/g, '').trim();
  }
  
  // Try to extract location
  const locationMatches = html.match(/<span[^>]*class="[^"]*location[^"]*"[^>]*>(.*?)<\/span>/i) ||
                         html.match(/<div[^>]*class="[^"]*location[^"]*"[^>]*>(.*?)<\/div>/i);
  
  if (locationMatches && locationMatches[1]) {
    data.location = locationMatches[1].replace(/<[^>]+>/g, '').trim();
  }
  
  // Try to extract job description
  const descriptionMatches = html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                            html.match(/<div[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                            html.match(/<section[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/section>/i);
  
  if (descriptionMatches && descriptionMatches[1]) {
    data.description = descriptionMatches[1].replace(/<[^>]+>/g, '\n').replace(/\s+/g, ' ').trim();
  }
  
  // Look for structured data in JSON-LD format (commonly used for job listings)
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (jsonLdMatch && jsonLdMatch[1]) {
    try {
      const jsonData = JSON.parse(jsonLdMatch[1]);
      
      // Check if it's a JobPosting schema
      if (jsonData["@type"] === "JobPosting") {
        if (!data.title && jsonData.title) {
          data.title = jsonData.title;
        }
        
        if (!data.company && jsonData.hiringOrganization?.name) {
          data.company = jsonData.hiringOrganization.name;
        }
        
        if (!data.location && jsonData.jobLocation?.address) {
          data.location = typeof jsonData.jobLocation.address === 'string' 
            ? jsonData.jobLocation.address 
            : `${jsonData.jobLocation.address.addressLocality || ''} ${jsonData.jobLocation.address.addressRegion || ''}`.trim();
        }
        
        if (!data.description && jsonData.description) {
          data.description = jsonData.description.replace(/<[^>]+>/g, '\n').replace(/\s+/g, ' ').trim();
        }
        
        // Extract additional fields
        if (jsonData.skills) {
          data.qualifications = Array.isArray(jsonData.skills) 
            ? jsonData.skills.join("\n• ") 
            : jsonData.skills;
        }
        
        if (jsonData.responsibilities) {
          data.responsibilities = Array.isArray(jsonData.responsibilities) 
            ? jsonData.responsibilities.join("\n• ") 
            : jsonData.responsibilities;
        }
      }
    } catch (e) {
      console.error('Error parsing JSON-LD:', e);
    }
  }
  
  return data;
}

// Extract specific job listing sections
function extractJobSections(html: string): string[] {
  const sections: string[] = [];
  
  // Common job section patterns on various job sites
  const sectionPatterns = [
    { regex: /<div[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, label: "Job Description" },
    { regex: /<div[^>]*class="[^"]*job-qualifications[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, label: "Qualifications" },
    { regex: /<div[^>]*class="[^"]*requirements[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, label: "Requirements" },
    { regex: /<div[^>]*class="[^"]*responsibilities[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, label: "Responsibilities" },
    { regex: /<div[^>]*id="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, label: "Job Description" },
    { regex: /<div[^>]*id="[^"]*job-requirements[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, label: "Requirements" },
    { regex: /<div[^>]*id="[^"]*qualifications[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, label: "Qualifications" },
    { regex: /<h2[^>]*>[^<]*(?:Requirements|Qualifications|Responsibilities|Description)[^<]*<\/h2>\s*<div[^>]*>([\s\S]*?)<\/div>/gi, label: "Job Section" },
    { regex: /<section[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/section>/gi, label: "Job Description" },
    // StepStone specific patterns
    { regex: /<div[^>]*class="[^"]*sc-gOTpEw[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, label: "StepStone Section" },
    { regex: /<div[^>]*class="[^"]*at-section-text-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, label: "StepStone Description" },
    { regex: /<div[^>]*class="[^"]*job-element[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, label: "Job Element" }
  ];
  
  for (const { regex, label } of sectionPatterns) {
    let match;
    while ((match = regex.exec(html)) !== null) {
      if (match[1]) {
        // Clean up the extracted HTML content
        const cleanText = match[1]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<[^>]+>/g, "\n")
          .replace(/\n+/g, "\n")
          .replace(/\s+/g, " ")
          .trim();
        
        if (cleanText.length > 50) {
          sections.push(`${label}:\n${cleanText}`);
        }
      }
    }
  }
  
  // Extract bullet points from lists, which often contain requirements
  const listMatches = html.match(/<ul[^>]*>([\s\S]*?)<\/ul>/gi);
  if (listMatches) {
    for (const list of listMatches) {
      const listItems = list.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
      if (listItems && listItems.length > 2) {
        const bulletPoints = listItems
          .map(item => {
            const content = item.replace(/<li[^>]*>/i, "").replace(/<\/li>/i, "").replace(/<[^>]+>/g, "").trim();
            return content.length > 0 ? `• ${content}` : null;
          })
          .filter(Boolean)
          .join("\n");
        
        if (bulletPoints.length > 50) {
          sections.push(`List Items:\n${bulletPoints}`);
        }
      }
    }
  }
  
  return sections;
}

// Improved text extraction from HTML
function extractTextFromHtml(html: string): string {
  // Remove script and style tags and their content
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
  
  // Remove common non-content sections
  text = text.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ");
  text = text.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ");
  text = text.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ");
  text = text.replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, " ");
  text = text.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, " ");
  
  // Process HTML tags to keep some structure
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n\n$1\n\n"); 
  text = text.replace(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/gi, "\n\n$1\n\n");
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n");
  text = text.replace(/<br[^>]*>/gi, "\n");
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "• $1\n");
  text = text.replace(/<dt[^>]*>(.*?)<\/dt>/gi, "\n$1: ");
  text = text.replace(/<dd[^>]*>(.*?)<\/dd>/gi, "$1\n");
  
  // Process important semantic elements
  text = text.replace(/<article[^>]*>(.*?)<\/article>/gi, "\n$1\n");
  text = text.replace(/<section[^>]*>(.*?)<\/section>/gi, "\n$1\n");
  text = text.replace(/<div[^>]*>(.*?)<\/div>/gi, "$1 ");
  
  // Try to capture text in span elements
  text = text.replace(/<span[^>]*>(.*?)<\/span>/gi, "$1 ");
  
  // Try to extract alt text from images as it can contain valuable information
  const altTextRegex = /<img[^>]*alt=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = altTextRegex.exec(html)) !== null) {
    if (match[1] && match[1].length > 5) {  // Only use substantial alt text
      text += " " + match[1];
    }
  }
  
  // Remove remaining HTML tags
  text = text.replace(/<[^>]*>/g, " ");
  
  // Fix HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, "\"");
  text = text.replace(/&apos;/g, "'");
  text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
  text = text.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  // Normalize whitespace
  text = text.replace(/\s+/g, " ");
  text = text.replace(/\n\s*\n\s*\n+/g, "\n\n");
  
  return text.trim();
}
