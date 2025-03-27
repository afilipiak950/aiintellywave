
import { useState, useRef, useEffect } from 'react';
import { useSmartSearch } from '@/hooks/use-smart-search';
import { useAISearch } from '@/hooks/use-ai-search';
import SearchInput from '@/components/ui/search/SearchInput';
import AISearchResults from '@/components/ui/search/AISearchResults';
import SmartSuggestions from '@/components/ui/search/SmartSuggestions';

const SearchBar = () => {
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use smart search hook for suggestions
  const { 
    query, 
    setQuery, 
    isLoading: isSuggestionsLoading, 
    error: suggestionsError, 
    suggestions 
  } = useSmartSearch();
  
  // Use AI search hook for AI-powered responses
  const {
    isSearching,
    aiResponse,
    error: aiError,
    performAISearch,
    setError
  } = useAISearch();

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

  // Effect to perform AI search whenever query changes with debounce
  useEffect(() => {
    if (query.trim() && showResults) {
      const delaySearch = setTimeout(() => {
        console.log('Initiating AI search with query:', query);
        performAISearch(query);
      }, 500); // 500ms delay to avoid too many requests while typing
      
      return () => clearTimeout(delaySearch);
    }
  }, [query, showResults, performAISearch]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setShowResults(true);
    console.log('Form submitted, performing AI search with query:', query);
    // Clear any previous errors
    setError('');
    await performAISearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleInputFocus = () => {
    setShowResults(true);
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <form onSubmit={handleSearch}>
        <SearchInput
          ref={inputRef}
          query={query}
          setQuery={setQuery}
          onFocus={handleInputFocus}
          onClear={clearSearch}
        />
      </form>

      {showResults && (
        <AISearchResults 
          isSearching={isSearching}
          error={aiError}
          aiResponse={aiResponse}
        />
      )}
    </div>
  );
};

export default SearchBar;
