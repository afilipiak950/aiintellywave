
import { toast } from "../../../hooks/use-toast";

/**
 * Handles errors in auth services with appropriate error messages and logging
 */
export function handleAuthError(error: any, context: string): string {
  console.error(`Error in ${context}:`, error);
  
  const errorMsg = error.code 
    ? `Database error (${error.code}): ${error.message}`
    : error.message 
      ? `Error: ${error.message}`
      : `Failed to ${context}. Please try again.`;
  
  toast({
    title: "Error",
    description: errorMsg,
    variant: "destructive"
  });
  
  return errorMsg;
}
