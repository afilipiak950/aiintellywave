import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { search_string_id, type, input_source, input_text, input_url, user_id } = await req.json();
    
    if (!search_string_id) {
      return new Response(
        JSON.stringify({ error: 'search_string_id is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing search string: ${search_string_id}, type: ${type}, source: ${input_source}`);

    // First, verify the search string exists and get its current state
    const { data: searchString, error: fetchError } = await supabase
      .from('search_strings')
      .select('*')
      .eq('id', search_string_id)
      .single();
      
    if (fetchError || !searchString) {
      console.error('Error fetching search string:', fetchError);
      return new Response(
        JSON.stringify({ error: `Search string not found: ${fetchError?.message || 'Unknown error'}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Update status to processing
    const { error: updateError } = await supabase
      .from('search_strings')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', search_string_id);
      
    if (updateError) {
      console.error('Error updating search string status:', updateError);
      return new Response(
        JSON.stringify({ error: `Failed to update search string status: ${updateError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    let content = '';
    let sourceDetails = {};
    
    // Process different input sources
    if (input_source === 'text' && input_text) {
      console.log('Processing text input, length:', input_text.length);
      content = input_text;
      sourceDetails = { sourceType: 'text' };
        
    } else if (input_source === 'website' && (input_url || input_text)) {
      try {
        // If we already have text content from the website scraper, use it
        if (input_text) {
          console.log('Using pre-scraped website content, length:', input_text.length);
          content = input_text;
          
          try {
            const domain = new URL(input_url).hostname;
            sourceDetails = { 
              sourceType: 'website', 
              domain, 
              url: input_url 
            };
          } catch (e) {
            sourceDetails = { 
              sourceType: 'website', 
              url: input_url 
            };
          }
        }
        // Otherwise, call the website-scraper function
        else {
          console.log('Scraping website:', input_url);
          // Call website-scraper function to get the content
          const { data: scraperData, error: scraperError } = await supabase.functions
            .invoke('website-scraper', {
              body: { url: input_url },
            });
            
          if (scraperError || !scraperData?.success) {
            throw new Error(scraperError || (scraperData?.error || 'Unknown error scraping website'));
          }
          
          content = scraperData.text;
          console.log('Successfully scraped content, length:', content.length);
          
          sourceDetails = { 
            sourceType: 'website', 
            domain: scraperData.domain || '', 
            url: input_url 
          };
        }
      } catch (e) {
        console.error('Error scraping website:', e);
        
        // Update status to failed
        await supabase
          .from('search_strings')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', search_string_id);
          
        return new Response(
          JSON.stringify({ error: `Failed to scrape website: ${e.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    } else {
      // Update status to failed
      await supabase
        .from('search_strings')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', search_string_id);
        
      return new Response(
        JSON.stringify({ error: 'Invalid input source or missing required data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Generate search string
    try {
      console.log('Generating search string from content');
      
      // Generate the search string with enhanced algorithms
      const searchString = type === 'recruiting' 
        ? generateRecruitingSearchString(content, sourceDetails) 
        : generateLeadGenSearchString(content, sourceDetails);
        
      console.log('Generated search string:', searchString);
      
      // Update search string with result
      const { error: updateError } = await supabase
        .from('search_strings')
        .update({
          generated_string: searchString,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', search_string_id);
        
      if (updateError) {
        console.error('Error updating search string with result:', updateError);
        
        // Update status to failed
        await supabase
          .from('search_strings')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', search_string_id);
          
        return new Response(
          JSON.stringify({ error: `Failed to update search string with result: ${updateError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
        
      return new Response(
        JSON.stringify({ success: true, generated_string: searchString }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (e) {
      console.error('Error generating search string:', e);
      
      // Update status to failed
      await supabase
        .from('search_strings')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', search_string_id);
        
      return new Response(
        JSON.stringify({ error: `Error generating search string: ${e.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in generate-search-string function:', error);
    
    return new Response(
      JSON.stringify({ error: `Function error: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Generate a search string for recruiting purposes
function generateRecruitingSearchString(text: string, sourceDetails: any): string {
  console.log('Generating recruiting search string with source type:', sourceDetails.sourceType);
  
  // Extract job title and skills from the text
  const jobTitle = extractJobTitle(text);
  const skills = extractSkills(text);
  const qualifications = extractQualifications(text);
  const location = extractLocation(text);
  
  const jobSiteKeywords = [
    // Job title variations
    jobTitle,
    // Common resume keywords
    "resume", "CV", "curriculum vitae", "Lebenslauf", "Bewerbung"
  ].filter(Boolean);
  
  // Build boolean search string
  let searchString = "";
  
  // Job title part (required)
  if (jobTitle) {
    searchString = `("${jobTitle}")`;
  } else {
    // Extract most important keywords if job title couldn't be found
    const keywords = extractKeywords(text, 5);
    if (keywords.length > 0) {
      searchString = `(${keywords.slice(0, 3).map(k => `"${k}"`).join(" OR ")})`;
    } else {
      searchString = `("job" OR "position" OR "karriere" OR "stelle")`;
    }
  }
  
  // Location part (if available)
  if (location) {
    searchString += ` AND (${location.map(loc => `"${loc}"`).join(" OR ")})`;
  }
  
  // Skills part (if available)
  if (skills.length > 0) {
    searchString += ` AND (${skills.slice(0, 5).map(s => `"${s}"`).join(" OR ")})`;
  }
  
  // Qualifications part (if available)
  if (qualifications.length > 0) {
    searchString += ` AND (${qualifications.slice(0, 3).map(q => `"${q}"`).join(" OR ")})`;
  }
  
  // Resume keywords part (required)
  searchString += ` AND ("resume" OR "CV" OR "curriculum vitae" OR "Lebenslauf" OR "Bewerbung")`;
  
  return searchString;
}

// Generate a search string for lead generation purposes
function generateLeadGenSearchString(text: string, sourceDetails: any): string {
  console.log('Generating lead generation search string with source type:', sourceDetails.sourceType);
  
  // Extract company and industry information
  const companyInfo = extractCompanyInfo(text);
  const industryTerms = extractIndustryTerms(text);
  const productTerms = extractProductTerms(text);
  const location = extractLocation(text);
  
  // Extract general keywords as fallback
  const keywords = extractKeywords(text, 10);
  
  // Build boolean search string
  let searchString = "";
  
  // Company part (if available)
  if (companyInfo.name) {
    searchString = `("${companyInfo.name}")`;
  } else if (sourceDetails.domain) {
    // Use domain name if company name not found
    const domainName = sourceDetails.domain.replace(/\.(com|de|eu|org|net)$/, '').replace('www.', '');
    searchString = `("${domainName}")`;
  } else {
    // Fall back to keywords
    searchString = `(${keywords.slice(0, 3).map(k => `"${k}"`).join(" OR ")})`;
  }
  
  // Industry part (if available)
  if (industryTerms.length > 0) {
    searchString += ` AND (${industryTerms.slice(0, 3).map(i => `"${i}"`).join(" OR ")})`;
  } else if (keywords.length > 3) {
    searchString += ` AND (${keywords.slice(3, 6).map(k => `"${k}"`).join(" OR ")})`;
  }
  
  // Product/service part (if available)
  if (productTerms.length > 0) {
    searchString += ` AND (${productTerms.slice(0, 3).map(p => `"${p}"`).join(" OR ")})`;
  }
  
  // Location part (if available)
  if (location.length > 0) {
    searchString += ` AND (${location.map(loc => `"${loc}"`).join(" OR ")})`;
  }
  
  // Business identifiers part (required)
  searchString += ` AND ("company" OR "business" OR "enterprise" OR "Unternehmen" OR "Firma" OR "GmbH" OR "AG")`;
  
  return searchString;
}

// Helper functions for extracting information from text

function extractJobTitle(text: string): string {
  // Common patterns for job titles
  const jobTitlePatterns = [
    /Job Title:\s*([^.\n]+)/i,
    /Position:\s*([^.\n]+)/i,
    /Stelle:\s*([^.\n]+)/i,
    /Stellenbezeichnung:\s*([^.\n]+)/i,
    /Jobtitel:\s*([^.\n]+)/i
  ];
  
  // Try to find an explicit job title
  for (const pattern of jobTitlePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Common job titles to look for
  const commonJobTitles = [
    // German jobs
    'Finanzbuchhalter', 'Buchhalter', 'Controller', 'Steuerberater', 'Finanzanalyst',
    'Wirtschaftsprüfer', 'Bilanzbuchhalter', 'Finanzmanager', 'Kreditsachbearbeiter',
    // English jobs
    'Financial Accountant', 'Accountant', 'Controller', 'Financial Analyst', 'Finance Manager',
    'Tax Advisor', 'Auditor', 'Compliance Officer', 'Credit Specialist'
  ];
  
  // Look for common job titles in the text
  for (const title of commonJobTitles) {
    if (text.includes(title)) {
      return title;
    }
  }
  
  // Try to extract job title based on content patterns
  const firstSentences = text.split(/[.!?]/).slice(0, 3).join('. ');
  const titleWords = firstSentences.match(/(?:suchen|looking for|einstellen|hire|position|stelle als|job as)\s+(?:eine?n?\s+)?([A-Z][a-zäöüß]+(?:\s+[A-Za-zäöüß]+){0,5})/i);
  
  if (titleWords && titleWords[1]) {
    return titleWords[1].trim();
  }
  
  return '';
}

function extractSkills(text: string): string[] {
  const skills: Set<string> = new Set();
  
  // Common skills sections
  const skillSections = [
    text.match(/(?:Skills|Fähigkeiten|Kenntnisse|Erfahrung|Qualifikationen|Requirements)(?:[\s:]*)([\s\S]*?)(?:\n\n|\n[A-Z])/i),
    text.match(/(?:Technical|Technische)(?:[\s:]*)([\s\S]*?)(?:\n\n|\n[A-Z])/i),
    text.match(/(?:• |\* )([\s\S]*?)(?:\n\n|\n[A-Z])/g)
  ];
  
  // Process each section
  for (const section of skillSections) {
    if (section) {
      const sectionText = Array.isArray(section) ? section[1] || section[0] : section;
      
      if (sectionText) {
        // Extract bullet points or comma-separated skills
        const skillItems = sectionText.split(/[•\*,;]/).map(item => item.trim()).filter(Boolean);
        
        for (const item of skillItems) {
          if (item.length > 3 && item.length < 50) {
            skills.add(item);
          }
        }
      }
    }
  }
  
  // Common technical skills for different job types
  const commonSkills = [
    // Finance & Accounting
    'SAP', 'DATEV', 'Excel', 'Financial Analysis', 'Budgeting', 'Controlling',
    'Accounting', 'Buchführung', 'Bilanzierung', 'Forecasting', 'Reporting',
    // IT
    'Java', 'Python', 'JavaScript', 'SQL', 'AWS', 'Azure', 'DevOps', 'Agile',
    'React', 'Angular', 'Node.js', 'Docker', 'Kubernetes', 'Cloud',
    // Languages
    'Deutsch', 'Englisch', 'Französisch', 'Spanisch', 'Italienisch',
    'German', 'English', 'French', 'Spanish', 'Italian'
  ];
  
  // Look for common skills in the text
  for (const skill of commonSkills) {
    if (text.includes(skill)) {
      skills.add(skill);
    }
  }
  
  return Array.from(skills);
}

function extractQualifications(text: string): string[] {
  const qualifications: Set<string> = new Set();
  
  // Common qualifications sections
  const qualificationsSections = [
    text.match(/(?:Qualifications|Qualifikationen|Ausbildung|Education|Bildung)(?:[\s:]*)([\s\S]*?)(?:\n\n|\n[A-Z])/i),
    text.match(/(?:We require|Wir erwarten|Voraussetzungen|Requirements)(?:[\s:]*)([\s\S]*?)(?:\n\n|\n[A-Z])/i)
  ];
  
  // Process each section
  for (const section of qualificationsSections) {
    if (section && section[1]) {
      // Extract bullet points or comma-separated qualifications
      const items = section[1].split(/[•\*,;]/).map(item => item.trim()).filter(Boolean);
      
      for (const item of items) {
        if (item.length > 3 && item.length < 80) {
          qualifications.add(item);
        }
      }
    }
  }
  
  // Common degrees and certifications
  const commonQualifications = [
    'Bachelor', 'Master', 'Diploma', 'PhD', 'CPA', 'CFA', 'MBA',
    'Bachelor-Abschluss', 'Master-Abschluss', 'Diplom', 'Promotion',
    'Ausbildung', 'Steuerberater', 'Wirtschaftsprüfer', 'Bankfachwirt',
    'Certified', 'Zertifiziert', 'Staatlich geprüft'
  ];
  
  // Look for common qualifications in the text
  for (const qualification of commonQualifications) {
    if (text.includes(qualification)) {
      // Try to find a more complete phrase
      const regex = new RegExp(`${qualification}[\\w\\s]{0,30}`, 'gi');
      const matches = text.match(regex);
      
      if (matches) {
        for (const match of matches) {
          if (match.length > qualification.length) {
            qualifications.add(match.trim());
          } else {
            qualifications.add(qualification);
          }
        }
      } else {
        qualifications.add(qualification);
      }
    }
  }
  
  return Array.from(qualifications);
}

function extractLocation(text: string): string[] {
  const locations: Set<string> = new Set();
  
  // Common location patterns
  const locationPatterns = [
    /(?:Location|Ort|Standort|Einsatzort|Place)(?:[\s:]*)([\s\S]*?)(?:\n|$)/i,
    /(?:in|at|near|around)\s+([A-Z][a-zäöüß]+(?:\s+[A-Z][a-zäöüß]+)?)/g,
    /([A-Z][a-zäöüß]+(?:\s+[A-Z][a-zäöüß]+)?),\s+(?:Germany|Deutschland|Austria|Österreich|Switzerland|Schweiz)/g,
  ];
  
  // Process each pattern
  for (const pattern of locationPatterns) {
    if (pattern instanceof RegExp) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 1) {
          locations.add(match[1].trim());
        }
      }
    }
  }
  
  // List of common German cities and countries to look for
  const commonLocations = [
    'Berlin', 'Hamburg', 'München', 'Munich', 'Köln', 'Cologne', 'Frankfurt', 
    'Düsseldorf', 'Stuttgart', 'Leipzig', 'Dresden', 'Hannover', 'Nürnberg', 
    'Nuremberg', 'Wien', 'Vienna', 'Zürich', 'Zurich', 'Basel', 'Bern',
    'Deutschland', 'Germany', 'Österreich', 'Austria', 'Schweiz', 'Switzerland'
  ];
  
  // Look for common locations in the text
  for (const location of commonLocations) {
    if (text.includes(location)) {
      locations.add(location);
    }
  }
  
  return Array.from(locations);
}

function extractCompanyInfo(text: string): any {
  const companyInfo: any = { name: '' };
  
  // Common company patterns
  const namePatterns = [
    /(?:Company|Firma|Unternehmen|About Us|Über uns)(?:[\s:]*)([\s\S]*?)(?:\n\n|\n[A-Z])/i,
    /(?:Wir sind|We are|Company name is)\s+([A-Z][a-zA-Z0-9äöüß&\s-]+(?:GmbH|AG|SE|KG|OHG|LLC|Ltd|Inc)?)/i,
  ];
  
  // Try to extract company name
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      if (name.length > 2 && name.length < 50) {
        companyInfo.name = name;
        break;
      }
    }
  }
  
  // Look for common company pattern with legal form
  if (!companyInfo.name) {
    const legalFormMatch = text.match(/([A-Z][a-zA-Z0-9äöüß\s-]+)\s+(GmbH|AG|SE|KG|OHG|LLC|Ltd|Inc)/i);
    if (legalFormMatch) {
      companyInfo.name = `${legalFormMatch[1]} ${legalFormMatch[2]}`.trim();
    }
  }
  
  return companyInfo;
}

function extractIndustryTerms(text: string): string[] {
  const industries: Set<string> = new Set();
  
  // Common industries
  const commonIndustries = [
    'Finance', 'Banking', 'Insurance', 'Technology', 'IT', 'Software', 'Healthcare',
    'Manufacturing', 'Automotive', 'Construction', 'Education', 'Retail', 'E-commerce',
    'Telecommunications', 'Energy', 'Real Estate', 'Consulting', 'Legal', 'Media',
    'Finanzen', 'Banken', 'Versicherung', 'Technologie', 'Gesundheitswesen',
    'Fertigung', 'Automobil', 'Bauwesen', 'Bildung', 'Einzelhandel', 'Energie',
    'Immobilien', 'Beratung', 'Recht', 'Medien'
  ];
  
  // Look for industry mentions
  for (const industry of commonIndustries) {
    if (text.includes(industry)) {
      industries.add(industry);
    }
  }
  
  return Array.from(industries);
}

function extractProductTerms(text: string): string[] {
  const products: Set<string> = new Set();
  
  // Common product/service patterns
  const productPatterns = [
    /(?:Products|Produkte|Services|Dienstleistungen|Our solutions|Unsere Lösungen)(?:[\s:]*)([\s\S]*?)(?:\n\n|\n[A-Z])/i,
    /(?:We offer|Wir bieten|We provide|Wir stellen bereit)\s+([^.!?\n]+)/gi
  ];
  
  // Try to extract products or services
  for (const pattern of productPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const items = match[1].split(/[•\*,;]/).map(item => item.trim()).filter(Boolean);
        
        for (const item of items) {
          if (item.length > 3 && item.length < 50) {
            products.add(item);
          }
        }
      }
    }
  }
  
  return Array.from(products);
}

function extractKeywords(text: string, maxWords: number): string[] {
  // Extract all words from text (minimum 4 characters to avoid stop words)
  const words = text.split(/[\s,.;:]+/).filter(word => word.length > 3);
  
  // Remove duplicates with case insensitive check
  const uniqueWords = Array.from(new Set(words.map(word => word.toLowerCase())))
    .map(lowerCaseWord => {
      // Find the original word with preserved casing
      const original = words.find(w => w.toLowerCase() === lowerCaseWord);
      return original || lowerCaseWord;
    });
  
  // Extended stopwords in multiple languages
  const stopwords = [
    // English
    "and", "the", "with", "from", "this", "that", "have", "been", "would", "there", "their",
    "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between",
    "both", "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't",
    "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for",
    // German
    "nicht", "eine", "einer", "einen", "einem", "ein", "der", "die", "das", "sie", "und", 
    "für", "auf", "ist", "sind", "oder", "als", "dann", "nach", "durch", "über", "unter",
    "auch", "wenn", "wird", "werden", "wurde", "wurden", "sein", "seine", "seinen", "seiner",
    "hat", "hatte", "hatten", "haben", "wir", "mich", "mir", "dich", "dir", "uns", "euch",
    // Common words in multiple languages that are usually not specific
    "email", "phone", "contact", "website", "address", "info", "information", "welcome",
    "click", "service", "services", "home", "page"
  ];
  
  // Filter out stopwords and too short words
  const filteredWords = uniqueWords.filter(word => 
    !stopwords.includes(word.toLowerCase()) && word.length > 3
  );
  
  // Sort words by potential importance (prioritize capitalized words, which are often proper nouns)
  const rankedWords = filteredWords.sort((a, b) => {
    // Prioritize capitalized words
    const aIsCapitalized = a.charAt(0) === a.charAt(0).toUpperCase();
    const bIsCapitalized = b.charAt(0) === b.charAt(0).toUpperCase();
    
    if (aIsCapitalized && !bIsCapitalized) return -1;
    if (!aIsCapitalized && bIsCapitalized) return 1;
    
    // Then by length (longer words are often more specific)
    return b.length - a.length;
  });
  
  // Return the top N keywords
  return rankedWords.slice(0, maxWords);
}
