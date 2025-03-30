
// Function to fetch and parse website content
export async function crawlWebsite(url: string, maxPages: number = 20, maxDepth: number = 2) {
  console.log(`Starting crawl of ${url} with maxPages=${maxPages}, maxDepth=${maxDepth}`);
  
  // Ensure URL has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  try {
    // Parse base domain to stay within same site
    const baseUrl = new URL(url);
    const domain = baseUrl.hostname;
    console.log(`Base domain: ${domain}`);
    
    // Track visited URLs and pages to crawl
    const visited = new Set<string>();
    const toVisit: { url: string; depth: number }[] = [{ url, depth: 0 }];
    let pageCount = 0;
    let textContent = "";
    
    // Process pages until we reach limits
    while (toVisit.length > 0 && pageCount < maxPages) {
      const current = toVisit.shift();
      if (!current) continue;
      
      const { url: currentUrl, depth } = current;
      
      // Skip if already visited or over depth limit
      if (visited.has(currentUrl) || depth > maxDepth) continue;
      
      console.log(`Crawling ${currentUrl} (depth ${depth})`);
      visited.add(currentUrl);
      pageCount++;
      
      try {
        // Fetch page content
        const response = await fetch(currentUrl);
        
        if (response.status !== 200) {
          console.log(`Failed to fetch ${currentUrl}: ${response.status}`);
          continue;
        }
        
        // Extract text content
        const html = await response.text();
        const plainText = extractTextFromHtml(html);
        textContent += `\n\n--- PAGE: ${currentUrl} ---\n${plainText}`;
        
        // Only extract new links if we're not at max depth
        if (depth < maxDepth) {
          const links = extractLinks(html, domain, currentUrl);
          
          for (const link of links) {
            if (!visited.has(link) && !toVisit.some(item => item.url === link)) {
              toVisit.push({ url: link, depth: depth + 1 });
            }
          }
        }
        
      } catch (error) {
        console.log(`Error fetching ${currentUrl}: ${error.message}`);
      }
    }
    
    console.log(`Crawl complete: ${pageCount} pages processed`);
    return { 
      success: true, 
      textContent, 
      pageCount,
      domain 
    };
  } catch (error) {
    console.error(`Crawl failed: ${error.message}`);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Simple HTML text extraction
function extractTextFromHtml(html: string): string {
  // Remove script and style tags and their content
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
  
  // Remove HTML tags and decode entities
  text = text.replace(/<[^>]*>/g, " ");
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, "\"");
  
  // Normalize whitespace
  text = text.replace(/\s+/g, " ");
  
  return text.trim();
}

// Extract links from HTML that belong to the same domain
function extractLinks(html: string, domain: string, baseUrl: string): string[] {
  const links: string[] = [];
  const linkRegex = /href=["'](https?:\/\/[^"']+)["']/g;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[1]);
      // Only include links from the same domain
      if (url.hostname === domain) {
        links.push(url.href);
      }
    } catch (e) {
      // Skip invalid URLs
    }
  }
  
  // Also try relative URLs
  const relLinkRegex = /href=["'](\/[^"']+)["']/g;
  while ((match = relLinkRegex.exec(html)) !== null) {
    try {
      const base = new URL(baseUrl);
      const fullUrl = `${base.protocol}//${base.hostname}${match[1]}`;
      links.push(fullUrl);
    } catch (e) {
      // Skip invalid URLs
    }
  }
  
  return links;
}
