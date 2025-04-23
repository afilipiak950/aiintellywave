
import { useState } from 'react';
import { useAuth } from '@/context/auth';
import { SearchStringSource, SearchStringType } from '../search-string-types';

export const useSearchStringCreatorState = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  // Basic form state
  const [type, setType] = useState<SearchStringType>('recruiting');
  const [inputSource, setInputSource] = useState<SearchStringSource>('text');
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  
  // Processing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  
  return {
    // Auth state
    user,
    isAuthenticated,
    
    // Form state
    type,
    setType,
    inputSource,
    setInputSource,
    inputText,
    setInputText,
    inputUrl,
    setInputUrl,
    
    // Processing state
    isSubmitting,
    setIsSubmitting,
    isPreviewLoading,
    setIsPreviewLoading
  };
};
