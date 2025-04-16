
// Import required dependencies
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors-headers.ts";
import { supabase } from "../_shared/supabase-client.ts";

// Clay API configuration
const CLAY_API_TOKEN = Deno.env.get('CLAY_API_TOKEN');
const CLAY_TEMPLATE_ID = Deno.env.get('CLAY_TEMPLATE_ID') || "tpl_Ci72J1jDIZA1LTYZOj2RgRNZ";

// Handler function to generate contact suggestions
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchId, jobs, query } = await req.json();
    
    if (!searchId || !jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: searchId or jobs array", 
          message: "Bitte stellen Sie sicher, dass eine gültige Suche durchgeführt wurde."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Processing contact suggestion for search ID: ${searchId}`);
    console.log(`Number of job listings to analyze: ${jobs.length}`);
    
    // Get the first company from the job listings to find contacts
    const firstJob = jobs[0];
    const companyName = firstJob.company;
    const jobTitle = firstJob.title;
    
    console.log(`Finding contacts for company: ${companyName}, position: ${jobTitle}`);
    
    if (!CLAY_API_TOKEN) {
      console.error("Clay API token missing. Check environment variables.");
      // Return a fallback suggestion instead of error
      const fallbackSuggestion = createFallbackSuggestion(companyName, jobTitle);
      
      // Try to update the search record with the fallback suggestion if it's not a temporary search
      if (searchId !== 'temporary-search') {
        try {
          const { error: updateError } = await supabase
            .from("job_search_history")
            .update({ ai_contact_suggestion: fallbackSuggestion })
            .eq("id", searchId);
            
          if (updateError) {
            console.error("Error updating search record with fallback suggestion:", updateError);
          }
        } catch (err) {
          console.error("Error updating search with fallback:", err);
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, suggestion: fallbackSuggestion }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    try {
      // Call Clay API to find HR contacts
      const clayResponse = await searchClayContacts(companyName);
      
      if (!clayResponse || !clayResponse.success) {
        console.error("Failed to get valid response from Clay API:", clayResponse?.error || "Unknown error");
        // Return a fallback suggestion if Clay API fails
        const fallbackSuggestion = createFallbackSuggestion(companyName, jobTitle);
        
        // Try to update the search record with the fallback suggestion
        if (searchId !== 'temporary-search') {
          try {
            const { error: updateError } = await supabase
              .from("job_search_history")
              .update({ ai_contact_suggestion: fallbackSuggestion })
              .eq("id", searchId);
              
            if (updateError) {
              console.error("Error updating search record with fallback suggestion:", updateError);
            }
          } catch (err) {
            console.error("Error updating search with fallback:", err);
          }
        }
        
        return new Response(
          JSON.stringify({ success: true, suggestion: fallbackSuggestion }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Format the contact data for the response
      const contactSuggestion = formatContactSuggestion(clayResponse.data, companyName, jobTitle);
      
      // Update the job search record with the contact suggestion
      if (searchId !== 'temporary-search') {
        try {
          const { error: updateError } = await supabase
            .from("job_search_history")
            .update({ ai_contact_suggestion: contactSuggestion })
            .eq("id", searchId);
            
          if (updateError) {
            console.error("Error updating search record with contact suggestion:", updateError);
          }
        } catch (err) {
          console.error("Error updating search with contact suggestion:", err);
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, suggestion: contactSuggestion }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (callError) {
      console.error("Error during Clay API call:", callError);
      // Return a fallback suggestion if there's an error
      const fallbackSuggestion = createFallbackSuggestion(companyName, jobTitle);
      
      return new Response(
        JSON.stringify({ success: true, suggestion: fallbackSuggestion }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unexpected error in generate-contact-suggestion:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Function to call Clay API and find HR contacts
async function searchClayContacts(companyName: string) {
  try {
    console.log(`Searching Clay API for contacts at ${companyName}`);
    
    const response = await fetch(`https://api.clay.com/v1/templates/${CLAY_TEMPLATE_ID}/enrich`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLAY_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: [{
          company_name: companyName,
          department: "HR",
          find_decision_makers: true
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Clay API error (${response.status}):`, errorData);
      return { success: false, error: `API returned status ${response.status}` };
    }
    
    const data = await response.json();
    console.log("Clay API response received:", JSON.stringify(data).substring(0, 200) + "...");
    
    return { success: true, data };
  } catch (error) {
    console.error("Error calling Clay API:", error);
    return { success: false, error: error.message };
  }
}

// Function to format contact data into a structured suggestion
function formatContactSuggestion(clayData: any, companyName: string, jobTitle: string) {
  try {
    // If no valid Clay data is returned, create a fallback suggestion
    if (!clayData || !clayData.results || clayData.results.length === 0) {
      return createFallbackSuggestion(companyName, jobTitle);
    }
    
    // Extract the first result from Clay API
    const contact = clayData.results[0];
    
    // Create a structured suggestion with the Clay data
    return {
      // Contact information
      hr_contact: {
        name: contact.full_name || `HR Manager at ${companyName}`,
        position: contact.title || "HR Manager",
        email: contact.email || `hr@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
        phone: contact.phone || "+49 (Standard nicht verfügbar)",
        linkedin: contact.linkedin_url || null
      },
      
      // Company information
      company: {
        name: companyName,
        website: contact.company_website || null,
        linkedin: contact.company_linkedin_url || null
      },
      
      // Job details
      job: {
        title: jobTitle
      },
      
      // Contact template
      email_template: createEmailTemplate(contact.full_name || "HR Manager", companyName, jobTitle),
      
      // Metadata
      metadata: {
        source: "Clay API",
        confidence_score: contact.confidence_score || 0.75,
        generated_at: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Error formatting contact suggestion:", error);
    return createFallbackSuggestion(companyName, jobTitle);
  }
}

// Create a fallback suggestion when Clay API doesn't return valid data
function createFallbackSuggestion(companyName: string, jobTitle: string) {
  const companyDomain = companyName.toLowerCase().replace(/\s+/g, "");
  
  return {
    hr_contact: {
      name: `HR Manager at ${companyName}`,
      position: "HR Manager",
      email: `hr@${companyDomain}.com`,
      phone: "+49 (nicht verfügbar)",
      linkedin: null
    },
    company: {
      name: companyName,
      website: null,
      linkedin: null
    },
    job: {
      title: jobTitle
    },
    email_template: createEmailTemplate("HR Manager", companyName, jobTitle),
    metadata: {
      source: "Fallback Generator",
      confidence_score: 0.3,
      generated_at: new Date().toISOString()
    }
  };
}

// Create an email template for contacting the HR person
function createEmailTemplate(contactName: string, companyName: string, jobTitle: string) {
  return `Betreff: Bewerbung für die Position "${jobTitle}"

Sehr geehrte(r) ${contactName},

ich habe Ihre Stellenausschreibung für die Position "${jobTitle}" bei ${companyName} gesehen und möchte mich hiermit bewerben.

Meine Fähigkeiten und Erfahrungen passen hervorragend zu den Anforderungen dieser Position, und ich bin überzeugt, dass ich einen wertvollen Beitrag zu Ihrem Team leisten kann.

Im Anhang finden Sie meinen Lebenslauf und ein Anschreiben mit weiteren Details zu meinen Qualifikationen.

Ich freue mich auf die Möglichkeit, meine Bewerbung in einem persönlichen Gespräch zu vertiefen.

Mit freundlichen Grüßen,
[Ihr Name]`;
}
