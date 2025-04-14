
import { SearchStringType, SearchStringSource } from '../search-string-types';

export const useSearchStringSubmission = ({
  user,
  isAuthenticated,
  setIsSubmitting,
  inputSource,
  inputText,
  inputUrl,
  selectedFile,
  createSearchString,
  setInputText,
  setInputUrl,
  setSelectedFile,
  setPreviewString,
  onError,
  toast,
  type
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      const errorMsg = "You must be logged in to create search strings";
      console.error(errorMsg);
      toast({
        title: "Authorization Required",
        description: errorMsg,
        variant: "destructive"
      });
      if (onError) onError(errorMsg);
      return;
    }
    
    if (inputSource === 'text' && !inputText) {
      const errorMsg = "Please enter text to generate a search string";
      console.error(errorMsg);
      toast({
        title: "Input Required",
        description: errorMsg,
        variant: "destructive"
      });
      if (onError) onError(errorMsg);
      return;
    }
    
    if (inputSource === 'website' && !inputUrl) {
      const errorMsg = "Please enter a URL to generate a search string";
      console.error(errorMsg);
      toast({
        title: "URL Required",
        description: errorMsg,
        variant: "destructive"
      });
      if (onError) onError(errorMsg);
      return;
    }
    
    if (inputSource === 'pdf' && !selectedFile) {
      const errorMsg = "Please upload a PDF file to generate a search string";
      console.error(errorMsg);
      toast({
        title: "File Required",
        description: errorMsg,
        variant: "destructive"
      });
      if (onError) onError(errorMsg);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onError) onError(null);
      
      console.log('Creating search string with user info:', {
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        isAdmin: user.is_admin,
        isManager: user.is_manager,
        isCustomer: user.is_customer
      });
      
      const result = await createSearchString(
        type, 
        inputSource, 
        inputSource === 'text' ? inputText : undefined,
        inputSource === 'website' ? inputUrl : undefined,
        inputSource === 'pdf' ? selectedFile : null
      );
      
      if (result) {
        setInputText('');
        setInputUrl('');
        setSelectedFile(null);
        setPreviewString(null);
        
        toast({
          title: "Success",
          description: "Search string has been created and is being processed."
        });
      }
    } catch (error) {
      console.error('Error creating search string:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      if (typeof errorMessage === 'string' && errorMessage.includes('Could not find the \'progress\' column')) {
        const detailedError = "Database schema error: The progress column is missing. Please contact the administrator.";
        console.error(detailedError, {
          userId: user.id,
          error: errorMessage
        });
        
        if (onError) onError(detailedError);
        toast({
          title: "Database Error",
          description: "There's a problem with the database structure. Your search string was created but progress tracking is unavailable.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('row-level security') || errorMessage.includes('permission denied')) {
        const detailedError = "Permission denied: You don't have access to create search strings. Please check with your administrator.";
        console.error(detailedError, {
          userId: user.id,
          error: errorMessage
        });
        
        if (onError) onError(detailedError);
        toast({
          title: "Permission Error",
          description: detailedError,
          variant: "destructive"
        });
      } else {
        if (onError) onError(`Failed to create search string: ${errorMessage}`);
        toast({
          title: "Error",
          description: `Failed to create search string: ${errorMessage}`,
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit
  };
};
