
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
    
    if (!pdf_path) {
      throw new Error("PDF path is required");
    }
    
    // Create a storage client
    console.log(`Processing PDF from path: ${pdf_path}`);
    
    // Get the file from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('search_strings_files')
      .download(pdf_path);
      
    if (fileError) {
      console.error("Error downloading file:", fileError);
      throw new Error(`Failed to download PDF: ${fileError.message}`);
    }
    
    // Convert the file to base64
    const reader = new FileReader();
    const base64Promise = new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(fileData);
    });
    
    const base64Data = await base64Promise;
    const base64Content = String(base64Data).split(',')[1];
    
    // Use OpenAI to extract text from PDF
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using GPT-4o which can handle vision
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that extracts text from PDFs."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all the relevant text from this PDF document. Focus on information that would be useful for creating a search string for recruiting or lead generation."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64Content}`
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });
    
    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const aiResult = await openAIResponse.json();
    const extractedText = aiResult.choices[0].message.content.trim();
    
    // Update the search string record with the extracted text
    const { data, error } = await supabase
      .from('search_strings')
      .update({
        input_text: extractedText,
        status: 'processing'
      })
      .eq('id', search_string_id)
      .select();
    
    if (error) {
      console.error("Error updating search string with PDF text:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        extracted_text: extractedText,
        record: data?.[0] 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing PDF:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
