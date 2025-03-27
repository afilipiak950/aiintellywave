import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setShowResults(true);
    
    if (isAiMode) {
      setIsSearching(true);
      setAiResponse('');
      setError('');
      
      try {
        console.log('Attempting AI search with query:', query.trim());

        const { data, error } = await supabase.functions.invoke('ai-search', {
          body: { query: query.trim() }
        });

        console.log('AI Search Response:', { data, error });

        if (error) {
          console.error('AI search error:', error);
          const errorMessage = error.message || 'Failed to get an answer. Please try again later.';
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
    } else {
      if (query.toLowerCase().includes('project')) {
        navigate('/customer/projects');
      } else if (query.toLowerCase().includes('profile')) {
        navigate('/customer/profile');
      } else if (query.toLowerCase().includes('appointment')) {
        navigate('/customer/appointments');
      } else {
        navigate('/customer/dashboard');
      }
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setAiResponse('');
    setError('');
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <form onSubmit={handleSearch}>
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {isAiMode ? 
              <MessageSquare className="h-4 w-4 text-gray-400" /> : 
              <Search className="h-4 w-4 text-gray-400" />
            }
          </div>
          <input
            ref={inputRef}
            type="search"
            className="block w-full pl-10 pr-14 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={isAiMode ? "Ask about the platform..." : "Search..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim() && (aiResponse || error)) {
                setShowResults(true);
              }
            }}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
            {query && (
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-500"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-xs ${isAiMode ? 'bg-indigo-100 text-indigo-700' : ''}`}
              onClick={() => setIsAiMode(!isAiMode)}
            >
              AI
            </Button>
          </div>
        </div>
      </form>

      {showResults && (query.trim() || aiResponse || error) && (
        <Card className="absolute z-50 top-full mt-1 w-full max-h-96 overflow-y-auto bg-white shadow-lg rounded-md border">
          <div className="p-4">
            {isSearching ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                <span className="ml-2 text-gray-600">Searching...</span>
              </div>
            ) : (
              <>
                {error ? (
                  <div className="text-red-500 py-2">{error}</div>
                ) : aiResponse ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="font-semibold mb-2">Answer:</div>
                    <div className="text-gray-700 whitespace-pre-line">{aiResponse}</div>
                  </div>
                ) : isAiMode ? (
                  <div className="text-gray-500 py-2">Type your question and press Enter</div>
                ) : (
                  <div className="text-gray-500 py-2">No results found</div>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
