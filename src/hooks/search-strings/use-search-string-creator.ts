
import { useState, useEffect, useCallback } from 'react';
import { useSearchStrings, SearchStringType, SearchStringSource } from '@/hooks/search-strings/use-search-strings';
import { useAuth } from '@/context/auth';
import { useToast } from '@/hooks/use-toast';

interface UseSearchStringCreatorProps {
  onError?: (error: string | null) => void;
}

export const useSearchStringCreator = ({ onError }: UseSearchStringCreatorProps) => {
  const { user, isAuthenticated } = useAuth();
  const { createSearchString, generatePreview, previewString, setPreviewString, selectedFile, setSelectedFile } = 
    useSearchStrings();
  const { toast } = useToast();
  
  const [type, setType] = useState<SearchStringType>('recruiting');
  const [inputSource, setInputSource] = useState<SearchStringSource>('text');
  const [inputText, setInputText] = useState<string>('');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);

  // Log authentication status on mount
  useEffect(() => {
    console.log('SearchStringCreator - Authentication status:', { 
      isAuthenticated, 
      userId: user?.id, 
      userEmail: user?.email,
      userRole: user?.role
    });
  }, [user, isAuthenticated]);

  const generateSourcePreview = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('Not generating preview - user not authenticated');
      return;
    }

    if (inputSource === 'text' && inputText) {
      try {
        setIsPreviewLoading(true);
        const preview = await generatePreview(type, inputSource, inputText);
        setPreviewString(preview);
      } catch (error) {
        console.error('Error generating preview:', error);
        toast({
          title: "Error",
          description: "Failed to generate preview",
          variant: "destructive"
        });
      } finally {
        setIsPreviewLoading(false);
      }
    } else if (inputSource === 'website' && inputUrl) {
      try {
        setIsPreviewLoading(true);
        const preview = await generatePreview(type, inputSource, undefined, inputUrl);
        setPreviewString(preview);
      } catch (error) {
        console.error('Error generating preview:', error);
        toast({
          title: "Error",
          description: "Failed to generate preview",
          variant: "destructive"
        });
      } finally {
        setIsPreviewLoading(false);
      }
    } else if (inputSource === 'pdf' && selectedFile) {
      try {
        setIsPreviewLoading(true);
        const preview = await generatePreview(type, inputSource, undefined, undefined, selectedFile);
        setPreviewString(preview);
      } catch (error) {
        console.error('Error generating preview:', error);
        toast({
          title: "Error",
          description: "Failed to generate preview",
          variant: "destructive"
        });
      } finally {
        setIsPreviewLoading(false);
      }
    } else {
      setPreviewString(null);
    }
  }, [type, inputSource, inputText, inputUrl, selectedFile, generatePreview, setPreviewString, toast, isAuthenticated]);

  // Generate preview when input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      generateSourcePreview();
    }, 500); // Add a small delay to avoid too many requests

    return () => clearTimeout(timer);
  }, [type, inputSource, inputText, inputUrl, selectedFile, generateSourcePreview]);

  const handleTypeChange = (value: SearchStringType) => {
    setType(value);
    setPreviewString(null);
  };

  const handleSourceChange = (value: SearchStringSource) => {
    setInputSource(value);
    setPreviewString(null);
    setInputText('');
    setInputUrl('');
    setSelectedFile(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

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
      // Clear any previous errors
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
        // Reset form on success
        setInputText('');
        setInputUrl('');
        setSelectedFile(null);
        setPreviewString(null);
        
        toast({
          title: "Success",
          description: "Search string has been created and is being processed. The website will be fully crawled and analyzed."
        });
      }
    } catch (error) {
      console.error('Error creating search string:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      if (errorMessage.includes('row-level security') || errorMessage.includes('permission denied')) {
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
    type,
    inputSource,
    inputText,
    inputUrl,
    isSubmitting,
    isPreviewLoading,
    previewString,
    handleTypeChange,
    handleSourceChange,
    handleTextChange,
    handleUrlChange,
    handleFileSelect,
    handleSubmit,
    isAuthenticated
  };
};
