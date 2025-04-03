
// Read environment variables for n8n API
export const n8nApiUrl = Deno.env.get("N8N_API_URL");
export const n8nApiKey = Deno.env.get("N8N_API_KEY");

// Check if environment variables are set
if (!n8nApiUrl || !n8nApiKey) {
  const missingVars = [];
  if (!n8nApiUrl) missingVars.push("N8N_API_URL");
  if (!n8nApiKey) missingVars.push("N8N_API_KEY");
  
  console.error(`[n8n-workflows] Missing required environment variables: ${missingVars.join(", ")}`);
}

console.log(`[n8n-workflows] N8N API URL: ${n8nApiUrl ? "Set" : "Not set"}`);
console.log(`[n8n-workflows] N8N API Key: ${n8nApiKey ? "Set" : "Not set"}`);
