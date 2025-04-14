// Function to fetch and parse website content
export async function crawlWebsite(url: string, maxPages: number = 20, maxDepth: number = 2) {
  console.log(`[CRAWLER] Starting crawl of ${url} with maxPages=${maxPages}, maxDepth=${maxDepth}`);
  
  // Ensure URL has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  try {
    // Parse base domain to stay within same site
    const baseUrl = new URL(url);
    const domain = baseUrl.hostname;
    console.log(`[CRAWLER] Base domain: ${domain}`);
    
    // Track visited URLs and pages to crawl
    const visited = new Set<string>();
    const toVisit: { url: string; depth: number }[] = [{ url, depth: 0 }];
    let pageCount = 0;
    let textContent = "";
    let failedUrls = 0;
    const maxFailedUrls = Math.min(10, maxPages / 2); // Allow some failed URLs before giving up
    
    // Timeout safety
    const startTime = Date.now();
    const maxTimeMs = 180000; // 3 minutes max for crawling
    
    // Process pages until we reach limits
    while (toVisit.length > 0 && pageCount < maxPages) {
      // Check for timeout
      if (Date.now() - startTime > maxTimeMs) {
        console.warn(`[CRAWLER] Time limit reached after processing ${pageCount} pages`);
        break;
      }
      
      // Check for too many failures
      if (failedUrls >= maxFailedUrls && pageCount === 0) {
        return {
          success: false,
          error: `Failed to access any page after ${failedUrls} attempts. Please check the URL and try again.`
        };
      }
      
      const current = toVisit.shift();
      if (!current) continue;
      
      const { url: currentUrl, depth } = current;
      
      // Skip if already visited or over depth limit
      if (visited.has(currentUrl) || depth > maxDepth) continue;
      
      console.log(`[CRAWLER] Crawling ${currentUrl} (depth ${depth}, page ${pageCount + 1}/${maxPages})`);
      visited.add(currentUrl);
      
      try {
        // Fetch page content with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout per request
        
        const response = await fetch(currentUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AITrainingBot/1.0; +https://example.com/bot)',
            'Accept': 'text/html,application/xhtml+xml,application/xml',
            'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }).finally(() => clearTimeout(timeoutId));
        
        if (!response.ok) {
          console.warn(`[CRAWLER] Failed to fetch ${currentUrl}: ${response.status} ${response.statusText}`);
          failedUrls++;
          
          // For job sites, try with different user agent if we get blocked
          if (response.status === 403 || response.status === 429) {
            try {
              console.log(`[CRAWLER] Retrying with different user agent for ${currentUrl}`);
              const retry = await fetch(currentUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml',
                  'Accept-Language': 'en-US,en;q=0.9,de;q=0.8'
                }
              });
              
              if (retry.ok) {
                const html = await retry.text();
                const plainText = extractTextFromHtml(html);
                pageCount++;
                textContent += `\n\n--- PAGE: ${currentUrl} ---\n${plainText}`;
              }
            } catch (e) {
              console.warn(`[CRAWLER] Retry with different user agent failed: ${e.message}`);
              continue;
            }
          }
          continue;
        }
        
        // Check content type to avoid binary files
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
          console.log(`[CRAWLER] Skipping non-HTML content: ${currentUrl} (${contentType})`);
          continue;
        }
        
        // Extract text content
        const html = await response.text();
        
        // Simple validation to ensure we received HTML
        if (!html || !html.includes('<html') || !html.includes('<body')) {
          console.warn(`[CRAWLER] Invalid HTML received from ${currentUrl}`);
          continue;
        }
        
        // Extract plain text and increase page count
        const plainText = extractTextFromHtml(html);
        if (plainText.trim().length > 50) { // Only count pages with meaningful content
          pageCount++;
          textContent += `\n\n--- PAGE: ${currentUrl} ---\n${plainText}`;
          
          // Only extract new links if we're not at max depth
          if (depth < maxDepth) {
            const links = extractLinks(html, domain, currentUrl);
            console.log(`[CRAWLER] Found ${links.length} links on ${currentUrl}`);
            
            // If this is a job board, prioritize job posting links
            const jobLinks = links.filter(link => 
              link.includes('/job/') || 
              link.includes('/jobs/') || 
              link.includes('/stellenangebot') || 
              link.includes('/karriere/') ||
              link.includes('/career/') || 
              link.includes('/careers/')
            );
            
            if (jobLinks.length > 0) {
              console.log(`[CRAWLER] Found ${jobLinks.length} job-related links, prioritizing these`);
              
              // Add job links first (with higher priority)
              for (const link of jobLinks) {
                if (!visited.has(link) && !toVisit.some(item => item.url === link)) {
                  // Insert at the beginning of the queue to prioritize
                  toVisit.unshift({ url: link, depth: depth + 1 });
                }
              }
              
              // Add other links afterwards
              const regularLinks = links.filter(link => !jobLinks.includes(link));
              for (const link of regularLinks) {
                if (!visited.has(link) && !toVisit.some(item => item.url === link)) {
                  toVisit.push({ url: link, depth: depth + 1 });
                }
              }
            } else {
              // No job links found, add all links
              for (const link of links) {
                if (!visited.has(link) && !toVisit.some(item => item.url === link)) {
                  toVisit.push({ url: link, depth: depth + 1 });
                }
              }
            }
          }
        } else {
          console.log(`[CRAWLER] Skipping page with insufficient content: ${currentUrl}`);
        }
        
      } catch (error) {
        console.warn(`[CRAWLER] Error fetching ${currentUrl}: ${error.message}`);
        failedUrls++;
      }
    }
    
    // Even if we found no pages, extract content directly from the initial URL as last resort
    if (pageCount === 0) {
      try {
        console.log(`[CRAWLER] Attempting direct content extraction from initial URL: ${url}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for last attempt
        
        // Try with a more common browser user agent
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml',
            'Accept-Language': 'en-US,en;q=0.9,de;q=0.8'
          }
        }).finally(() => clearTimeout(timeoutId));
        
        if (response.ok) {
          const html = await response.text();
          const plainText = extractTextFromHtml(html);
          
          if (plainText.trim().length > 100) {
            pageCount = 1;
            textContent = `\n\n--- PAGE: ${url} ---\n${plainText}`;
            console.log(`[CRAWLER] Successfully extracted content directly from initial URL`);
          }
        }
      } catch (directError) {
        console.error(`[CRAWLER] Failed direct content extraction: ${directError.message}`);
      }
      
      // If still no content, return error
      if (pageCount === 0) {
        return {
          success: false,
          error: "Could not extract content from any pages. Please check if the website is accessible and not blocking automated access."
        };
      }
    }
    
    console.log(`[CRAWLER] Crawl complete: ${pageCount} pages processed, ${textContent.length} chars extracted`);
    return { 
      success: true, 
      textContent, 
      pageCount,
      domain 
    };
  } catch (error) {
    console.error(`[CRAWLER] Crawl failed: ${error.message}`, error);
    return { 
      success: false, 
      error: `Website crawling failed: ${error.message}` 
    };
  }
}

// Enhanced HTML text extraction with focus on job-related content
function extractTextFromHtml(html: string): string {
  try {
    // Remove script and style tags and their content
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
    
    // Prioritize job-related sections with additional weight
    const jobSections: string[] = [];
    
    // Extract content from job-specific containers (common patterns in job sites)
    const jobPatterns = [
      /<div[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*job-details[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*job-requirements[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*job-qualifications[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*id="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<section[^>]*class="[^"]*job[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
      /<article[^>]*class="[^"]*job[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
      /<div[^>]*class="[^"]*stellenangebot[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*karriere[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*career[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
    ];
    
    // Extract job-specific sections
    for (const pattern of jobPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match[1]) {
          // Remove nested HTML from the extracted section
          const sectionText = match[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
          if (sectionText.length > 30) {  // Only consider substantial sections
            jobSections.push("\n" + sectionText + "\n");
          }
        }
      }
    }
    
    // Extract heading content which often contains job titles and important info
    const headingMatches = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi);
    if (headingMatches) {
      for (const heading of headingMatches) {
        const cleanHeading = heading.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        if (cleanHeading && cleanHeading.length > 2) {
          jobSections.push("\n### " + cleanHeading + "\n");
        }
      }
    }
    
    // Process list items which often contain requirements and qualifications
    const listItemMatches = html.match(/<li[^>]*>(.*?)<\/li>/gi);
    if (listItemMatches) {
      for (const item of listItemMatches) {
        const cleanItem = item.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        if (cleanItem && cleanItem.length > 10) {
          jobSections.push("• " + cleanItem);
        }
      }
    }
    
    // Remove navigation, header, footer, and other non-content tags
    text = text.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ");
    text = text.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ");
    text = text.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ");
    text = text.replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, " ");
    
    // Process HTML tags - keep meaningful headings and paragraphs structure
    text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n\n### $1\n\n"); // H1 gets special formatting
    text = text.replace(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/gi, "\n\n## $1\n\n"); // Other headings
    text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n"); // Paragraphs end with newline
    text = text.replace(/<br[^>]*>/gi, "\n"); // Line breaks become newlines
    text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "• $1\n"); // List items as bullets
    
    // Remove remaining HTML tags
    text = text.replace(/<[^>]*>/g, " ");
    
    // Fix HTML entities
    text = text.replace(/&nbsp;/g, " ");
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");
    text = text.replace(/&quot;/g, "\"");
    text = text.replace(/&apos;/g, "'");
    text = text.replace(/&#\d+;/g, " ");
    
    // Normalize whitespace
    text = text.replace(/\s+/g, " ");
    
    // Fix common issues: replace multiple newlines with max two
    text = text.replace(/\n\s*\n\s*\n+/g, "\n\n");
    
    // Combine job sections with general text
    let finalText = "";
    
    // Add job sections first as they're more important
    if (jobSections.length > 0) {
      finalText += "=== JOB DETAILS ===\n" + jobSections.join("\n") + "\n\n";
    }
    
    // Add general page text
    finalText += "=== GENERAL PAGE CONTENT ===\n" + text.trim();
    
    return finalText;
  } catch (e) {
    console.error("[CRAWLER] Error extracting text from HTML:", e);
    return ""; // Return empty string on error
  }
}

// Extract links from HTML that belong to the same domain
function extractLinks(html: string, domain: string, baseUrl: string): string[] {
  try {
    const links: string[] = [];
    const seenLinks = new Set<string>();
    const maxLinks = 100; // Limit number of links from a single page
    
    // Process absolute URLs
    const absoluteRegex = /href=["'](https?:\/\/[^"']+)["']/gi;
    let match;
    
    while ((match = absoluteRegex.exec(html)) !== null && links.length < maxLinks) {
      try {
        const url = new URL(match[1]);
        // Only include links from the same domain
        if (url.hostname === domain && !seenLinks.has(url.href)) {
          links.push(url.href);
          seenLinks.add(url.href);
        }
      } catch (e) {
        // Skip invalid URLs
      }
    }
    
    // Process relative URLs
    try {
      const base = new URL(baseUrl);
      const relRegex = /href=["'](\/[^"']+)["']/gi;
      while ((match = relRegex.exec(html)) !== null && links.length < maxLinks) {
        try {
          const fullUrl = `${base.protocol}//${base.hostname}${match[1]}`;
          if (!seenLinks.has(fullUrl)) {
            links.push(fullUrl);
            seenLinks.add(fullUrl);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
      
      // Also try relative URLs without leading slash
      const relNoSlashRegex = /href=["'](?!https?:\/\/)(?!\/)([\w\d\-._~:/?#[\]@!$&'()*+,;=]+)["']/gi;
      while ((match = relNoSlashRegex.exec(html)) !== null && links.length < maxLinks) {
        try {
          // Ensure we aren't capturing fragment-only urls (e.g., #section)
          if (match[1] && !match[1].startsWith('#') && !match[1].startsWith('javascript:')) {
            const path = base.pathname.endsWith('/') ? base.pathname : `${base.pathname.split('/').slice(0, -1).join('/')}/`;
            const fullUrl = `${base.protocol}//${base.hostname}${path}${match[1]}`;
            if (!seenLinks.has(fullUrl)) {
              links.push(fullUrl);
              seenLinks.add(fullUrl);
            }
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    } catch (e) {
      console.error("[CRAWLER] Error processing relative URLs:", e);
    }
    
    // Filter out common non-content pages
    return links.filter(link => {
      const url = new URL(link);
      const lowerPath = url.pathname.toLowerCase();
      
      // Filter out common file types that aren't useful for content
      if (/\.(css|js|jpg|jpeg|png|gif|svg|webp|ico|mp3|mp4|zip|pdf)(\?.*)?$/.test(lowerPath)) {
        return false;
      }
      
      // Filter out common non-content paths
      return !/(\/wp-admin\/|\/wp-content\/|\/wp-includes\/|\/admin\/|\/login\/|\/logout\/|\/cart\/|\/checkout\/)/.test(lowerPath);
    });
  } catch (e) {
    console.error("[CRAWLER] Error extracting links:", e);
    return []; // Return empty array on error
  }
}
