
import { useSearchStrings } from '@/hooks/search-strings/use-search-strings';
import { useToast } from '@/hooks/use-toast';
import { useSearchStringCreatorState } from './creator/use-search-string-creator-state';
import { useSearchStringPreviewHandler } from './creator/use-search-string-preview-handler';
import { useSearchStringSubmission } from './creator/use-search-string-submission';
import { useSearchStringHandlers } from './creator/use-search-string-handlers';

interface UseSearchStringCreatorProps {
  onError?: (error: string | null) => void;
}

export const useSearchStringCreator = ({ onError }: UseSearchStringCreatorProps) => {
  const { toast } = useToast();
  const { 
    createSearchString, 
    generatePreview, 
    previewString, 
    setPreviewString, 
    selectedFile, 
    setSelectedFile 
  } = useSearchStrings();
  
  const {
    user,
    isAuthenticated,
    type,
    setType,
    inputSource,
    setInputSource,
    inputText, 
    setInputText,
    inputUrl,
    setInputUrl,
    isSubmitting,
    setIsSubmitting,
    isPreviewLoading,
    setIsPreviewLoading
  } = useSearchStringCreatorState();

  const { generateSourcePreview } = useSearchStringPreviewHandler({
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
  });

  const { 
    handleSubmitWebsite, 
    handleSubmitText, 
    handleSubmitPDF, 
    handleSubmit: submissionHandleSubmit 
  } = useSearchStringSubmission({
    onSuccess: () => {
      setIsSubmitting(false);
      setInputText('');
      setInputUrl('');
      setSelectedFile(null);
      setPreviewString('');
    },
    onError: (err) => {
      setIsSubmitting(false);
      if (onError) onError(err);
    }
  });

  const {
    handleTypeChange,
    handleSourceChange,
    handleTextChange,
    handleUrlChange,
    handleFileSelect
  } = useSearchStringHandlers({
    setType,
    setInputSource,
    setInputText,
    setPreviewString,
    setInputUrl,
    setSelectedFile
  });

  // Custom submit handler that uses the appropriate submission method based on input source
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setIsSubmitting(true);

    try {
      if (inputSource === 'text' && inputText) {
        handleSubmitText(inputText, type);
      } else if (inputSource === 'website' && inputUrl) {
        handleSubmitWebsite(inputUrl, type);
      } else if (inputSource === 'pdf' && selectedFile) {
        handleSubmitPDF(selectedFile, type);
      } else {
        setIsSubmitting(false);
        toast({
          title: "Error",
          description: "Please provide valid input for the selected source type.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error in submit handler:", error);
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
