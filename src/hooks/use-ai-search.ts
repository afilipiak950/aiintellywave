
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export function useAISearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      // Cancel any pending requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Reset function to clear state
  const resetSearch = useCallback(() => {
    setAiResponse('');
    setError('');
    setIsSearching(false);
    
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const performAISearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    // Cancel any existing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    // Reset previous search results and errors
    setIsSearching(true);
    setAiResponse('');
    setError('');
    
    try {
      console.log('Attempting AI search with query:', query.trim());

      const { data, error: supabaseError } = await supabase.functions.invoke('ai-search', {
        body: { query: query.trim() }
      });

      // Always make sure we're resetting the loading state
      setIsSearching(false);

      if (supabaseError) {
        console.error('Supabase function error:', supabaseError);
        const errorMessage = supabaseError.message || 'Failed to get an answer. Please try again later.';
        setError(errorMessage);
        toast({
          title: "Search Error",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      } 
      
      if (data?.error) {
        console.error('AI response error:', data.error);
        setError(data.error);
        toast({
          title: "AI Response Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      } 
      
      if (data?.answer) {
        console.log('AI search response received:', data.answer.substring(0, 50) + '...');
        setAiResponse(data.answer);
        return;
      }

      // Fallback error if we get here
      const unexpectedError = 'Unexpected response format from AI search';
      console.error(unexpectedError, data);
      setError(unexpectedError);
      toast({
        title: "Unexpected Error",
        description: unexpectedError,
        variant: "destructive"
      });
      
    } catch (err) {
      console.error('AI search exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Search Error",
        description: errorMessage,
        variant: "destructive"
      });
      setIsSearching(false);
    }
  }, [toast]);

  return {
    isSearching,
    aiResponse,
    error,
    performAISearch,
    setAiResponse,
    setError,
    resetSearch
  };
}
