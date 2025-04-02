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
    const maxTimeMs = 120000; // 2 minutes max
    
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
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout per request
        
        const response = await fetch(currentUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 Neural Trainer Bot/1.0'
          }
        }).finally(() => clearTimeout(timeoutId));
        
        if (!response.ok) {
          console.warn(`[CRAWLER] Failed to fetch ${currentUrl}: ${response.status} ${response.statusText}`);
          failedUrls++;
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
            
            for (const link of links) {
              if (!visited.has(link) && !toVisit.some(item => item.url === link)) {
                toVisit.push({ url: link, depth: depth + 1 });
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
    
    if (pageCount === 0) {
      return {
        success: false,
        error: "Could not extract content from any pages. Please check if the website is accessible."
      };
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

// Enhanced HTML text extraction
function extractTextFromHtml(html: string): string {
  try {
    // Remove script and style tags and their content
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
    
    // Remove other common non-content tags
    text = text.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ");
    text = text.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ");
    text = text.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ");
    
    // Process HTML tags - keep meaningful headings and paragraphs structure
    text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, "\n$1\n\n"); // Headings get spacing
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
    
    return text.trim();
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
