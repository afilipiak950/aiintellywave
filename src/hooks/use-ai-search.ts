
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export function useAISearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const performAISearch = async (query: string) => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    setIsSearching(true);
    setAiResponse('');
    setError('');
    
    try {
      console.log('Attempting AI search with query:', query.trim());

      const { data, error: supabaseError } = await supabase.functions.invoke('ai-search', {
        body: { query: query.trim() }
      });

      console.log('AI Search Response:', { data, error: supabaseError });

      if (supabaseError) {
        console.error('Supabase function error:', supabaseError);
        const errorMessage = supabaseError.message || 'Failed to get an answer. Please try again later.';
        setError(errorMessage);
        toast({
          title: "Search Error",
          description: errorMessage,
          variant: "destructive"
        });
      } else if (data?.error) {
        console.error('AI response error:', data.error);
        setError(data.error);
        toast({
          title: "AI Response Error",
          description: data.error,
          variant: "destructive"
        });
      } else if (data?.answer) {
        setAiResponse(data.answer);
      } else {
        const unexpectedError = 'Unexpected response format from AI search';
        console.error(unexpectedError, data);
        setError(unexpectedError);
        toast({
          title: "Unexpected Error",
          description: unexpectedError,
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('AI search exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Search Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return {
    isSearching,
    aiResponse,
    error,
    performAISearch,
    setAiResponse,
    setError
  };
}
