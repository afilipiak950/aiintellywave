
// Configuration and environment variables
export const n8nApiUrl = Deno.env.get('N8N_API_URL');
export const n8nApiKey = Deno.env.get('N8N_API_KEY');

// Log environment check on startup
console.log("Edge function environment check:");
console.log(`- N8N API URL: ${n8nApiUrl ? "Set (starting with " + n8nApiUrl.substring(0, 20) + "...)" : "Not set"}`);
console.log(`- N8N API Key: ${n8nApiKey ? "Set (length: " + n8nApiKey.length + ")" : "Not set"}`);
