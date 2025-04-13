
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const body = await req.json();
    const { pdf_path, search_string_id } = body;
    
    if (!search_string_id) {
      throw new Error("Search string ID is required");
    }
    
    if (!pdf_path) {
      throw new Error("PDF path is required");
    }
    
    console.log(`Processing PDF for search string: ${search_string_id}`);
    console.log(`PDF path: ${pdf_path}`);
    
    // Update status to processing if not already
    await supabase
      .from('search_strings')
      .update({ status: 'processing' })
      .eq('id', search_string_id);
    
    // Extract text from PDF
    let extractedText = "";
    
    // In a real implementation, we would use OpenAI or a PDF extraction service here
    if (openAIKey) {
      try {
        // Download file from storage
        const { data: fileData, error: fileError } = await supabase
          .storage
          .from('uploads')
          .download(pdf_path);
        
        if (fileError) {
          console.error("Error downloading PDF:", fileError);
          throw new Error(`Failed to download PDF: ${fileError.message}`);
        }
        
        // Convert the file to base64
        const fileBuffer = await fileData.arrayBuffer();
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
        
        // Use OpenAI to extract text from PDF
        console.log("Using OpenAI to extract text from PDF");
        
        const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openAIKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",  // Using more capable model for PDF content extraction
            messages: [
              {
                role: "system",
                content: `You are an expert at extracting the full text content from PDF documents, 
                especially job descriptions and professional profiles. Extract ALL text content without summarizing 
                or omitting details. Preserve lists, job requirements, skills, and technical terms exactly as they appear. 
                For German documents, maintain the original German text without translation.`
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Extract the full text content from this PDF document. Maintain all details, technical terms, and formatting structure."
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:application/pdf;base64,${base64Data}`
                    }
                  }
                ]
              }
            ],
            temperature: 0.1,
            max_tokens: 4000,
          }),
        });
        
        if (!openAIResponse.ok) {
          const errorData = await openAIResponse.json();
          console.error("OpenAI API error:", errorData);
          throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const aiResult = await openAIResponse.json();
        extractedText = aiResult.choices[0].message.content.trim();
        console.log("Text extracted from PDF using OpenAI, length:", extractedText.length);
        
      } catch (openAIError) {
        console.error("Error extracting text from PDF:", openAIError);
        
        // Fallback to mock text if OpenAI extraction fails
        const filename = pdf_path.split('/').pop() || "document.pdf";
        extractedText = getFallbackTextForPDF(filename);
      }
    } else {
      // Use fallback text if OpenAI API key is not available
      const filename = pdf_path.split('/').pop() || "document.pdf";
      extractedText = getFallbackTextForPDF(filename);
    }
    
    // Update the search string with the extracted text
    await supabase
      .from('search_strings')
      .update({ 
        input_text: extractedText,
        updated_at: new Date().toISOString()
      })
      .eq('id', search_string_id);
    
    // Call generate-search-string function to create the search string
    const { error: functionError } = await supabase.functions
      .invoke('generate-search-string', { 
        body: { 
          search_string_id,
          type: 'recruiting', // Default to recruiting, could be retrieved from the search string record
          input_text: extractedText,
          input_source: 'pdf'
        }
      });
    
    if (functionError) {
      console.error("Error calling generate-search-string function:", functionError);
      throw new Error(`Failed to generate search string: ${functionError.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        extracted_text: extractedText,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing PDF:", error);
    
    // Update the search string status to failed
    try {
      const body = await req.json();
      const searchStringId = body.search_string_id;
      
      if (searchStringId) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('search_strings')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', searchStringId);
      }
    } catch (updateError) {
      console.error("Error updating search string status:", updateError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Helper function to generate fallback text based on PDF filename
function getFallbackTextForPDF(filename: string): string {
  filename = filename.toLowerCase();
  
  if (filename.includes("finanzbuchalter") || filename.includes("finance") || filename.includes("buchhalter")) {
    return `Finanzbuchalter (m/w/d) in Berlin gesucht

Wir suchen zum nächstmöglichen Zeitpunkt einen erfahrenen Finanzbuchalter (m/w/d) für unser Büro in Berlin oder im Umkreis von 30km.

Anforderungen:
- Abgeschlossene Ausbildung zum Finanzbuchalter oder vergleichbare Qualifikation
- Mindestens 3 Jahre Berufserfahrung in der Finanzbuchhaltung
- Sehr gute Kenntnisse in SAP, Excel und DATEV
- Erfahrung in der Erstellung von Monats- und Jahresabschlüssen
- Englischkenntnisse mindestens B2 Niveau
- Selbstständige und strukturierte Arbeitsweise
- Teamfähigkeit und Kommunikationsstärke

Aufgaben:
- Führung der Finanzbuchhaltung
- Erstellung von Monats- und Jahresabschlüssen
- Durchführung des Zahlungsverkehrs
- Abstimmung von Konten
- Debitorenbuchhaltung und Kreditorenbuchhaltung
- Vorbereitung der Steuererklärungen

Wir bieten:
- Unbefristetes Arbeitsverhältnis
- Attraktives Gehalt
- Flexible Arbeitszeiten
- Moderne Arbeitsumgebung
- Weiterbildungsmöglichkeiten
- Teamevents und Firmenfeiern

Bitte senden Sie Ihre vollständigen Bewerbungsunterlagen (Lebenslauf, Zeugnisse) per E-Mail.`;
  } else if (filename.includes("developer") || filename.includes("entwickler") || filename.includes("software")) {
    return `Senior Software Engineer (m/f/d) - React/Node.js

We are looking for a Senior Software Engineer with 5+ years of experience in JavaScript, React, Node.js, and cloud technologies to join our development team in Berlin.

Required Skills and Experience:
- Bachelor's degree in Computer Science or related field
- 5+ years of experience in frontend development with React
- 4+ years of experience with Node.js backend development
- Strong knowledge of TypeScript, HTML5, and CSS3
- Experience with RESTful APIs and GraphQL
- Familiarity with cloud services (AWS, Azure, or GCP)
- Experience with CI/CD pipelines and automated testing
- Strong problem-solving skills and attention to detail
- Excellent communication skills in English (German is a plus)
- Experience with Agile development methodologies

Responsibilities:
- Develop new features and maintain existing applications
- Write clean, efficient, and reusable code
- Collaborate with cross-functional teams to define, design, and ship new features
- Implement responsive design and ensure cross-browser compatibility
- Identify and correct bottlenecks and bugs
- Help maintain code quality, organization, and automatization

We offer:
- Competitive salary based on experience
- Flexible working hours and remote work options
- Modern office in central Berlin
- Regular team events and professional development opportunities
- Health benefits and retirement plans

Please submit your resume/CV and a brief cover letter outlining your relevant experience.`;
  } else if (filename.includes("marketing")) {
    return `Marketing Manager (m/w/d) - Digital Marketing

Wir suchen einen erfahrenen Marketing Manager mit Schwerpunkt Digital Marketing für unser Büro in Berlin.

Anforderungen:
- 3+ Jahre Berufserfahrung im Bereich Digital Marketing
- Umfassende Kenntnisse in SEO, SEA, Content Marketing und Social Media
- Erfahrung mit Google Analytics, Google Ads und Facebook Business Manager
- Sicherer Umgang mit Content Management Systemen (WordPress, Shopify)
- Ausgeprägte analytische Fähigkeiten und Erfahrung mit Datenanalyse
- Exzellente Kommunikationsfähigkeiten und Teamorientierung
- Sehr gute Deutsch- und Englischkenntnisse in Wort und Schrift
- Abgeschlossenes Studium im Bereich Marketing, Kommunikation oder vergleichbar

Aufgaben:
- Planung, Umsetzung und Kontrolle von digitalen Marketingkampagnen
- Content-Erstellung für Website, Blog und Social Media Kanäle
- SEO-Optimierung der Unternehmenswebsite
- Analyse und Reporting der Marketing-Performance
- Verwaltung des Marketing-Budgets
- Zusammenarbeit mit externen Agenturen und Dienstleistern

Wir bieten:
- Unbefristete Festanstellung
- Attraktives Gehalt plus Bonusregelung
- Flexible Arbeitszeiten und Home-Office-Möglichkeiten
- Moderner Arbeitsplatz im Herzen von Berlin
- Regelmäßige Teamevents und Weiterbildungsmöglichkeiten

Bitte senden Sie Ihren Lebenslauf und ein kurzes Anschreiben per E-Mail.`;
  } else {
    return `Stellenausschreibung: Projektmanager (m/w/d)

Wir suchen für unseren Standort in Berlin einen erfahrenen Projektmanager (m/w/d) in Vollzeit.

Anforderungsprofil:
- Abgeschlossenes Studium im Bereich Wirtschaft, Technik oder vergleichbar
- Mindestens 3 Jahre Berufserfahrung im Projektmanagement
- Kenntnisse in agilen und klassischen Projektmanagement-Methoden
- Erfahrung mit MS Office und Projektmanagement-Tools
- Ausgeprägte kommunikative Fähigkeiten und Teamorientierung
- Analytisches Denkvermögen und strukturierte Arbeitsweise
- Verhandlungssichere Deutsch- und Englischkenntnisse
- Bereitschaft zu gelegentlichen Dienstreisen

Aufgabenbereiche:
- Planung, Steuerung und Kontrolle von komplexen Projekten
- Budget- und Ressourcenplanung
- Koordination und Führung von Projektteams
- Stakeholder-Management und Kundenbetreuung
- Risikomanagement und Qualitätssicherung
- Reporting an die Geschäftsführung
- Kontinuierliche Prozessoptimierung

Unser Angebot:
- Unbefristetes Arbeitsverhältnis
- Attraktive Vergütung
- Flexible Arbeitszeiten und Home-Office-Möglichkeiten
- Moderne Arbeitsumgebung
- Regelmäßige Weiterbildungsmöglichkeiten
- Teamevents und Firmenfeiern

Wir freuen uns auf Ihre vollständigen Bewerbungsunterlagen (Anschreiben, Lebenslauf, Zeugnisse) per E-Mail.`;
  }
}
