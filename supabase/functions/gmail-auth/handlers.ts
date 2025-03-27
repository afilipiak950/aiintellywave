
/**
 * Request handlers for Gmail Auth edge function
 */

import { 
  handleDiagnosticRequest,
  handleAuthorizeRequest,
  handleTokenRequest,
  handleFetchRequest
} from "./handlers/index.ts";

// Export all handlers for use in the main index.ts file
export {
  handleDiagnosticRequest,
  handleAuthorizeRequest,
  handleTokenRequest,
  handleFetchRequest
};
