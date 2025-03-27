
import React, { forwardRef, useState } from 'react';
import { X } from 'lucide-react';
import KIIcon from '@/components/ui/icons/KIIcon';

interface SearchInputProps {
  query: string;
  setQuery: (query: string) => void;
  onFocus: () => void;
  onClear: () => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ query, setQuery, onFocus, onClear }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    const handleFocus = () => {
      setIsFocused(true);
      onFocus();
    };
    
    const handleBlur = () => {
      setIsFocused(false);
    };
    
    return (
      <div className={`relative flex items-center transition-all duration-300 ${
        isFocused ? 'scale-[1.02]' : 'scale-100'
      }`}>
        <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-all duration-300 ${
          isFocused ? 'text-primary scale-110' : 'text-primary/70'
        }`}>
          <KIIcon size={16} className={`${isFocused ? 'animate-pulse' : ''}`} />
        </div>
        <input
          ref={ref}
          type="text"
          className={`block w-full pl-10 pr-10 py-2 border rounded-md text-sm placeholder-gray-400 
          focus:outline-none focus:ring-2 transition-all duration-300 ${
            isFocused 
              ? 'border-primary/0 shadow-md shadow-primary/10 focus:ring-primary/50 bg-white' 
              : 'border-gray-300 focus:ring-primary/30 bg-gray-50'
          }`}
          placeholder="Ask about the platform or search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {query && (
            <button 
              type="button" 
              className="text-gray-400 hover:text-gray-500 transition-colors"
              onClick={onClear}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
