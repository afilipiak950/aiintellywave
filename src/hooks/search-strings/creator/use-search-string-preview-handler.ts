
import { useCallback, useEffect } from 'react';
import { SearchStringType, SearchStringSource } from '../search-string-types';

export const useSearchStringPreviewHandler = ({
  isAuthenticated,
  type,
  inputSource,
  inputText,
  inputUrl,
  selectedFile,
  setIsPreviewLoading,
  setPreviewString,
  generatePreview,
  toast
}) => {
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
  }, [type, inputSource, inputText, inputUrl, selectedFile, generatePreview, setPreviewString, toast, isAuthenticated, setIsPreviewLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      generateSourcePreview();
    }, 500); // Add a small delay to avoid too many requests

    return () => clearTimeout(timer);
  }, [type, inputSource, inputText, inputUrl, selectedFile, generateSourcePreview]);

  return {
    generateSourcePreview
  };
};
