
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

  const { handleSubmit } = useSearchStringSubmission({
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
