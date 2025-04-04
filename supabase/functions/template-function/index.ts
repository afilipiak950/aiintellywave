
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * This is a basic Edge Function template for Supabase.
 * It serves as a starting point for your integration logic.
 * 
 * Endpoints:
 * - GET /health: Returns a simple health-check message.
 * - POST /process: Accepts a JSON payload and echoes it back.
 * 
 * You can add more routes and processing logic as needed.
 */
serve(async (req: Request) => {
  try {
    const { pathname } = new URL(req.url);
    
    // Add CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
    
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Health-check endpoint: returns 200 OK with a message.
    if (req.method === "GET" && pathname === "/health") {
      return new Response(
        JSON.stringify({ status: "ok", message: "Edge function is working" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Example processing endpoint: accepts a JSON payload.
    if (req.method === "POST" && pathname === "/process") {
      const payload = await req.json();
      // Add your processing logic here, e.g. integrating with n8n workflows or training AI.
      return new Response(
        JSON.stringify({ message: "Data processed successfully", data: payload }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If no endpoint matches, return a 404 Not Found error.
    return new Response(
      JSON.stringify({ error: "Not Found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
    );
  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          "Content-Type": "application/json" 
        }, 
        status: 500 
      }
    );
  }
});
