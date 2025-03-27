
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export type SuggestionItem = {
  id: string;
  title: string;
  type: 'lead' | 'project' | 'campaign' | 'appointment' | 'document' | 'other';
  path: string;
  description?: string;
  relevance?: number;
};

export type SuggestionGroup = {
  type: string;
  label: string;
  items: SuggestionItem[];
};

interface SmartSuggestionsProps {
  query: string;
  isLoading: boolean;
  error?: string;
  suggestions: SuggestionGroup[];
  onSelectSuggestion: (suggestion: SuggestionItem) => void;
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  query,
  isLoading,
  error,
  suggestions,
  onSelectSuggestion
}) => {
  const navigate = useNavigate();

  const handleClick = (suggestion: SuggestionItem) => {
    onSelectSuggestion(suggestion);
    navigate(suggestion.path);
  };

  if (isLoading) {
    return (
      <Card className="absolute z-50 top-full mt-1 w-full max-h-96 overflow-y-auto bg-white shadow-lg rounded-md border">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-600">Searching...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="absolute z-50 top-full mt-1 w-full max-h-96 overflow-y-auto bg-white shadow-lg rounded-md border">
        <div className="text-red-500 p-4">{error}</div>
      </Card>
    );
  }

  if (suggestions.length === 0 && query.trim()) {
    return (
      <Card className="absolute z-50 top-full mt-1 w-full max-h-96 overflow-y-auto bg-white shadow-lg rounded-md border">
        <div className="p-4 text-gray-500">
          <p>No matches found for "{query}"</p>
          <p className="text-sm mt-1">Try a different search term or browse by category</p>
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="absolute z-50 top-full mt-1 w-full max-h-96 overflow-y-auto bg-white shadow-lg rounded-md border">
      <div className="p-2">
        {suggestions.map((group, groupIndex) => (
          <div key={group.type} className={groupIndex > 0 ? 'mt-2 pt-2 border-t' : ''}>
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {group.label}
            </div>
            <div className="mt-1">
              {group.items.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleClick(item)}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </div>
                  </div>
                  {item.description && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SmartSuggestions;
