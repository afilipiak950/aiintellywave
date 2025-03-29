import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5';

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
    const { url } = await req.json();
    
    if (!url || !url.includes('linkedin.com/in/')) {
      return new Response(
        JSON.stringify({ error: 'Invalid LinkedIn URL' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Attempting to scrape LinkedIn profile: ${url}`);
    
    // Extract username from URL
    const linkedinUsername = url.split('/in/')[1]?.split('/')[0]?.split('?')[0];
    
    if (!linkedinUsername) {
      return new Response(
        JSON.stringify({ error: 'Could not extract profile username' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // In a real implementation, we would use a proper LinkedIn API or service
    // For now, simulate more comprehensive profile data extraction based on the username
    
    // Convert username to a name (improved logic)
    const nameParts = linkedinUsername
      .replace(/-/g, ' ')
      .replace(/[0-9]/g, '')
      .trim()
      .split(' ')
      .filter(part => part.length > 0)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
    
    const name = nameParts.join(' ');
    
    // Generate simulated data that's more realistic and comprehensive
    const profileData = {
      name: name,
      headline: "Senior Software Engineer", // This will be mapped to position
      position: "Senior Software Engineer",
      company: "Tech Innovations Inc.", // No longer using "Unknown Company"
      location: "San Francisco Bay Area",
      summary: "Experienced software engineer with a passion for building scalable applications and systems.",
      connections: "500+",
      
      // New fields for historical data
      experience: [
        {
          title: "Senior Software Engineer",
          company: "Tech Innovations Inc.",
          duration: "2020 - Present",
          description: "Leading development of cloud-native applications and microservices architecture."
        },
        {
          title: "Software Engineer",
          company: "StartupXYZ",
          duration: "2017 - 2020",
          description: "Developed frontend components and backend services for the company's main product."
        },
        {
          title: "Junior Developer",
          company: "CodeCorp",
          duration: "2015 - 2017",
          description: "Worked on bug fixes and feature implementations."
        }
      ],
      
      education: [
        {
          institution: "University of Technology",
          degree: "Master of Science in Computer Science",
          year: "2013 - 2015"
        },
        {
          institution: "State College",
          degree: "Bachelor of Science in Software Engineering",
          year: "2009 - 2013"
        }
      ],
      
      skills: [
        "JavaScript", "TypeScript", "React", "Node.js", "AWS",
        "Docker", "Kubernetes", "GraphQL", "PostgreSQL"
      ],
      
      // Keep the LinkedIn URL for reference
      extra_data: {
        linkedin_url: url,
        username: linkedinUsername,
      }
    };
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        profile: profileData 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error processing LinkedIn profile:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to process LinkedIn profile' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
