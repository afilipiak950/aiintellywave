
import { useState, useEffect } from 'react';
import { SearchStringType, SearchStringSource } from '../search-string-types';
import { useAuth } from '@/context/auth';

export const useSearchStringCreatorState = () => {
  const { user, isAuthenticated } = useAuth();
  const [type, setType] = useState<SearchStringType>('recruiting');
  const [inputSource, setInputSource] = useState<SearchStringSource>('text');
  const [inputText, setInputText] = useState<string>('');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log('SearchStringCreator - Authentication status:', { 
      isAuthenticated, 
      userId: user?.id, 
      userEmail: user?.email,
      userRole: user?.role
    });
  }, [user, isAuthenticated]);

  return {
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
  };
};
