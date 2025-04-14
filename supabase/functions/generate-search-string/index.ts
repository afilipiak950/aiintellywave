import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS request for CORS
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const {
      search_string_id,
      type,
      input_source,
      input_text,
      input_url,
      user_id
    } = await req.json();
    
    if (!search_string_id) {
      return new Response(
        JSON.stringify({ error: 'search_string_id is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Update search string status to show we're generating
    try {
      const { error: updateError } = await supabase
        .from('search_strings')
        .update({ 
          status: 'processing',
          progress: 50
        })
        .eq('id', search_string_id);
      
      if (updateError) {
        console.error('Error updating search string status:', updateError);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
    
    // Generate the search string based on the input
    let generatedString = '';
    
    if (!input_text || input_text.length < 50) {
      // If no text or very short text, update as failed
      try {
        const { error: updateError } = await supabase
          .from('search_strings')
          .update({ 
            status: 'failed',
            error: 'Insufficient content provided for generation'
          })
          .eq('id', search_string_id);
        
        if (updateError) {
          console.error('Error updating search string status:', updateError);
        }
      } catch (err) {
        console.error('Failed to update status:', err);
      }
      
      return new Response(
        JSON.stringify({ error: 'Insufficient content provided for generation' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Generating search string for type: ${type}, source: ${input_source}`);
    
    try {
      // Extract skills, job title, location, and other relevant information from the input
      const keywordsAndPhrases = extractKeywordsAndPhrases(input_text);
      const jobTitle = extractJobTitle(input_text);
      const location = extractLocation(input_text);
      const skills = extractSkills(input_text);
      const experienceLevel = extractExperienceLevel(input_text);
      const degreeRequirements = extractDegreeRequirements(input_text);
      
      console.log('Extracted data:', {
        jobTitle,
        location,
        experienceLevel,
        skillsCount: skills.length
      });
      
      // Generate different types of search strings based on the type
      if (type === 'recruiting') {
        // Format for recruiting search string
        generatedString = generateRecruitingSearchString(
          jobTitle,
          skills,
          location,
          experienceLevel,
          degreeRequirements
        );
      } else if (type === 'lead_generation') {
        // Format for lead generation search string
        generatedString = generateLeadGenerationSearchString(
          keywordsAndPhrases,
          location
        );
      } else {
        // Default fallback format
        generatedString = generateGenericSearchString(keywordsAndPhrases);
      }
      
      // Update search string with generated content
      try {
        const { error: updateError } = await supabase
          .from('search_strings')
          .update({ 
            generated_string: generatedString,
            status: 'completed',
            progress: 100,
            updated_at: new Date().toISOString()
          })
          .eq('id', search_string_id);
        
        if (updateError) {
          console.error('Error updating search string with generated content:', updateError);
          throw updateError;
        }
      } catch (updateErr) {
        console.error('Failed to update search string with generated content:', updateErr);
        throw updateErr;
      }
      
      return new Response(
        JSON.stringify({ generated_string: generatedString }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error generating search string:', error);
      
      // Update search string status to failed
      try {
        const { error: updateError } = await supabase
          .from('search_strings')
          .update({ 
            status: 'failed',
            error: `Generation error: ${error.message}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', search_string_id);
        
        if (updateError) {
          console.error('Error updating search string status to failed:', updateError);
        }
      } catch (updateErr) {
        console.error('Failed to update search string status to failed:', updateErr);
      }
      
      return new Response(
        JSON.stringify({ error: `Failed to generate search string: ${error.message}` }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper functions for extracting information
function extractKeywordsAndPhrases(text) {
  // Extract keywords and phrases from text
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
    .split(/\s+/)              // Split by whitespace
    .filter(word => word.length > 3 && !commonWords.includes(word)); // Filter out short words and common words
  
  // Count word frequency
  const wordCounts = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Get top keywords by frequency
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(entry => entry[0]);
}

function extractJobTitle(text) {
  // Try to extract job title from text
  const jobTitlePatterns = [
    /job title:?\s*([^,\.\n]+)/i,
    /position:?\s*([^,\.\n]+)/i,
    /stelle:?\s*([^,\.\n]+)/i,
    /job:?\s*([^,\.\n]+)/i,
    /role:?\s*([^,\.\n]+)/i,
    /(software engineer|developer|projektmanager|manager|architect|consultant|specialist|analyst|director|lead|head|chief|officer)/i
  ];
  
  for (const pattern of jobTitlePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // If no match found, try to identify job title by common keywords
  const jobTitleKeywords = [
    'engineer', 'developer', 'manager', 'director', 'specialist',
    'analyst', 'designer', 'architect', 'consultant', 'coordinator',
    'administrator', 'lead', 'head', 'chief', 'officer'
  ];
  
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    for (const keyword of jobTitleKeywords) {
      if (words[i+1].toLowerCase().includes(keyword)) {
        return `${words[i]} ${words[i+1]}`.replace(/[^\w\s]/g, '').trim();
      }
    }
  }
  
  return '';
}

function extractLocation(text) {
  // Try to extract location from text
  const locationPatterns = [
    /location:?\s*([^,\.\n]+)/i,
    /standort:?\s*([^,\.\n]+)/i,
    /ort:?\s*([^,\.\n]+)/i,
    /city:?\s*([^,\.\n]+)/i,
    /based in:?\s*([^,\.\n]+)/i,
    /based at:?\s*([^,\.\n]+)/i,
    /in (berlin|münchen|hamburg|köln|frankfurt|stuttgart|düsseldorf|dortmund|essen|leipzig|bremen|dresden|hannover|nürnberg|duisburg|bochum|wuppertal|bielefeld|bonn|münster|mannheim|karlsruhe|augsburg|wiesbaden|mönchengladbach|gelsenkirchen|aachen|chemnitz|kiel|halle|magdeburg|freiburg|krefeld|lübeck|oberhausen|erfurt|mainz|rostock|kassel|hagen|hamm|saarbrücken|mülheim|potsdam|ludwigshafen|oldenburg|leverkusen|osnabrück|solingen|heidelberg|herne|neuss|darmstadt|paderborn|regensburg|ingolstadt|würzburg|fürth|wolfsburg|offenbach|ulm|heilbronn|pforzheim|göttingen|bottrop|trier|recklinghausen|reutlingen|koblenz|bergisch gladbach|jena|remscheid|erlangen|moers|siegen|hildesheim|salzgitter)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
}

function extractSkills(text) {
  // Common technical skills to look for
  const technicalSkills = [
    // Programming languages
    'java', 'python', 'javascript', 'typescript', 'c#', 'c++', 'ruby', 'go', 'php', 'swift', 'kotlin', 'rust', 'scala',
    // Frameworks
    'react', 'angular', 'vue', 'django', 'flask', 'spring', 'node.js', 'express', 'asp.net', '.net', 'rails',
    // Databases
    'sql', 'mysql', 'postgresql', 'mongodb', 'oracle', 'sqlserver', 'dynamodb', 'redis', 'cassandra', 'elasticsearch',
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'ci/cd', 'devops',
    // Data Science
    'machine learning', 'ml', 'ai', 'data science', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'r',
    // Other tech skills
    'rest', 'api', 'microservices', 'agile', 'scrum', 'git', 'linux', 'unix', 'html', 'css', 'sass', 'redux',
    'graphql', 'oauth', 'saml', 'hadoop', 'spark', 'kafka', 'rabbitmq', 'websocket', 'jquery', 'webpack'
  ];
  
  // Look for skills in the text
  const found = [];
  const lowerText = text.toLowerCase();
  
  for (const skill of technicalSkills) {
    if (lowerText.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  }
  
  return found;
}

function extractExperienceLevel(text) {
  // Try to extract experience level
  const experiencePatterns = [
    /(\d+)[+]?\s*(years?|jahre)\s*(of)?\s*(experience|erfahrung)/i,
    /(senior|junior|mid-level|entry-level|principal|lead|staff)/i,
    /(berufserfahrung|erfahrung)\s*:?\s*(\d+)[+]?\s*(years?|jahre)?/i
  ];
  
  for (const pattern of experiencePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[1] && !isNaN(match[1])) {
        return `${match[1]}+ years`;
      } else if (match[1]) {
        return match[1];
      } else if (match[2] && !isNaN(match[2])) {
        return `${match[2]}+ years`;
      }
    }
  }
  
  return '';
}

function extractDegreeRequirements(text) {
  // Try to extract degree requirements
  const degreePatterns = [
    /(bachelor'?s?|master'?s?|phd|doctorate|bs|ms|ba|ma)\s*(degree|abschluss)?/i,
    /(degree|abschluss)\s*in\s*([^,\.\n]+)/i,
    /(studium|education|ausbildung)\s*:?\s*([^,\.\n]+)/i
  ];
  
  for (const pattern of degreePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2] && match[1] !== 'degree' && match[1] !== 'abschluss') {
        return `${match[1]} in ${match[2]}`.trim();
      } else if (match[1]) {
        return match[1].trim();
      }
    }
  }
  
  return '';
}

// Functions to generate different types of search strings
function generateRecruitingSearchString(jobTitle, skills, location, experienceLevel, degreeRequirements) {
  let searchString = '';
  
  // Add job title if found
  if (jobTitle) {
    searchString += `"${jobTitle}" `;
  }
  
  // Add location with OR operator if found
  if (location) {
    searchString += `(${location} OR remote) `;
  }
  
  // Add top skills with OR operator
  if (skills.length > 0) {
    const topSkills = skills.slice(0, 5);
    searchString += `(${topSkills.join(' OR ')}) `;
  }
  
  // Add experience level if found
  if (experienceLevel) {
    searchString += `"${experienceLevel}" `;
  }
  
  // Add degree requirements if found
  if (degreeRequirements) {
    searchString += `"${degreeRequirements}" `;
  }
  
  // Add LinkedIn-specific format if this is likely for LinkedIn
  searchString += 'site:linkedin.com/in/ ';
  
  // If we have skills, add some common exclusions
  if (skills.length > 0) {
    searchString += '-intitle:"profiles" -intitle:"directory"';
  }
  
  return searchString.trim();
}

function generateLeadGenerationSearchString(keywords, location) {
  let searchString = '';
  
  // Add top keywords with OR operator
  if (keywords.length > 0) {
    const topKeywords = keywords.slice(0, 5);
    searchString += `(${topKeywords.join(' OR ')}) `;
  }
  
  // Add location with OR operator if found
  if (location) {
    searchString += `"${location}" `;
  }
  
  // Add potential company identifiers
  searchString += '(GmbH OR AG OR "Co. KG" OR company OR firma OR unternehmen) ';
  
  // Add common exclusions
  searchString += '-template -example -sample -jobs -stellenangebote -wiki -wikipedia';
  
  return searchString.trim();
}

function generateGenericSearchString(keywords) {
  let searchString = '';
  
  // Add top keywords with OR operator
  if (keywords.length > 0) {
    const topKeywords = keywords.slice(0, 8);
    const groups = [];
    
    // Group keywords in pairs for better search precision
    for (let i = 0; i < topKeywords.length; i += 2) {
      if (i + 1 < topKeywords.length) {
        groups.push(`("${topKeywords[i]}" AND "${topKeywords[i+1]}")`);
      } else {
        groups.push(`"${topKeywords[i]}"`);
      }
    }
    
    searchString = groups.join(' OR ');
  }
  
  return searchString.trim();
}

// Common words to filter out when extracting keywords
const commonWords = [
  'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
  'his', 'they', 'say', 'her', 'she', 'will', 'from', 'what', 'make', 'when',
  'can', 'more', 'like', 'time', 'just', 'know', 'people', 'year', 'your', 'than',
  'then', 'some', 'now', 'very', 'über', 'auch', 'sind', 'eine', 'oder', 'wir',
  'wird', 'sein', 'einen', 'dem', 'mehr', 'wurde', 'können', 'hat', 'als', 'zur',
  'sie', 'sollen', 'must', 'können', 'muss', 'soll', 'sollte', 'müssen', 'haben',
  'unser', 'unsere', 'ihre', 'ihr', 'ihren', 'seiner', 'seine', 'seinen', 'unserem'
];
