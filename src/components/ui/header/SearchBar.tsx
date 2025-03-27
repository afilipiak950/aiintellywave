
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartSearch } from '@/hooks/use-smart-search';
import { useAISearch } from '@/hooks/use-ai-search';
import SearchInput from '@/components/ui/search/SearchInput';
import AISearchResults from '@/components/ui/search/AISearchResults';
import SmartSuggestions from '@/components/ui/search/SmartSuggestions';

const SearchBar = () => {
  const [isAiMode] = useState(true); // Always AI mode by default
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
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
    performAISearch
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setShowResults(true);
    
    if (isAiMode) {
      await performAISearch(query);
    } else {
      handleSimpleSearch();
    }
  };

  const handleSimpleSearch = () => {
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
  };

  const clearSearch = () => {
    setQuery('');
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleSelectSuggestion = () => {
    setShowResults(false);
    // Navigation is handled in the SmartSuggestions component
  };
  
  const handleInputFocus = () => {
    if (query.trim()) {
      setShowResults(true);
    }
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
        <>
          {isAiMode ? (
            <AISearchResults 
              isSearching={isSearching}
              error={aiError}
              aiResponse={aiResponse}
            />
          ) : (
            <SmartSuggestions 
              query={query}
              isLoading={isSuggestionsLoading}
              error={suggestionsError || ''}
              suggestions={suggestions}
              onSelectSuggestion={handleSelectSuggestion}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SearchBar;
