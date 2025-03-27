
import React, { forwardRef } from 'react';
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
    return (
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <KIIcon size={16} className="text-primary" />
        </div>
        <input
          ref={ref}
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Ask about the platform or search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={onFocus}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {query && (
            <button 
              type="button" 
              className="text-gray-400 hover:text-gray-500"
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
