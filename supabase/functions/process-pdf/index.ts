
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
    let extractedText = "This is sample text extracted from a PDF document about job requirements including skills like JavaScript, React, and project management.";
    
    // In a real implementation, we would use OpenAI or a PDF extraction service here
    // For this mock implementation, we'll simulate PDF text extraction
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
        
        // Use OpenAI to extract text - in a real implementation
        console.log("Would use OpenAI to extract text from PDF");
        
        // For now, use mock text
        extractedText = "Senior Software Engineer position requires 5+ years of experience in JavaScript, React, Node.js, and cloud technologies. The ideal candidate will have a Bachelor's degree in Computer Science or related field, strong problem-solving skills, and experience with Agile development methodologies.";
      } catch (openAIError) {
        console.error("Error extracting text from PDF:", openAIError);
        // Continue with mock text
      }
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
