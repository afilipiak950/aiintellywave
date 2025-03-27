
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import SuggestionGroup from './SuggestionGroup';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptySearchState from './EmptySearchState';
import { SuggestionGroup as SuggestionGroupType, SuggestionItem } from './types';

export type { SuggestionItem, SuggestionGroup } from './types';

interface SmartSuggestionsProps {
  query: string;
  isLoading: boolean;
  error?: string;
  suggestions: SuggestionGroupType[];
  onSelectSuggestion: (suggestion: SuggestionItem) => void;
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  query,
  isLoading,
  error,
  suggestions,
  onSelectSuggestion
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (suggestions.length === 0 && query.trim()) {
    return <EmptySearchState query={query} />;
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="absolute z-50 top-full mt-1 w-full max-h-96 overflow-y-auto bg-white shadow-lg rounded-md border">
      <div className="p-2">
        {suggestions.map((group, groupIndex) => (
          <SuggestionGroup
            key={group.type}
            group={group}
            onSelectSuggestion={onSelectSuggestion}
            isFirstGroup={groupIndex === 0}
          />
        ))}
      </div>
    </Card>
  );
};

export default SmartSuggestions;
