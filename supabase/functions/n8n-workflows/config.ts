
// n8n API Configuration
export const n8nApiUrl = Deno.env.get("N8N_API_URL") || "https://intellywave.app.n8n.cloud/home/workflows";
export const n8nApiKey = Deno.env.get("N8N_API_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYzY1N2VlYy1lY2ExLTQzZjgtODJhZS01MzU1YWI0NDdjNmIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQzNjk2NDMwfQ.0yomCBtNsMwrOkzFMyPgmzyqJfAwETRh6D-gbQdyyPg";

// Validate configuration at startup
export function validateConfig() {
  const missingConfigs = [];
  
  if (!n8nApiUrl) missingConfigs.push("N8N_API_URL");
  if (!n8nApiKey) missingConfigs.push("N8N_API_KEY");
  
  if (missingConfigs.length > 0) {
    console.error(`[n8n-workflows] Missing required environment variables: ${missingConfigs.join(", ")}`);
    return false;
  }
  
  console.info("[n8n-workflows] Configuration validated successfully");
  console.info(`[n8n-workflows] Using n8n API URL: ${n8nApiUrl}`);
  return true;
}
