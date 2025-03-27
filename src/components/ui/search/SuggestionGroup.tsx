
import React from 'react';
import SuggestionItem from './SuggestionItem';
import { SuggestionGroup as SuggestionGroupType, SuggestionItem as SuggestionItemType } from './types';

interface SuggestionGroupProps {
  group: SuggestionGroupType;
  onSelectSuggestion: (suggestion: SuggestionItemType) => void;
  isFirstGroup: boolean;
}

const SuggestionGroup: React.FC<SuggestionGroupProps> = ({ 
  group, 
  onSelectSuggestion, 
  isFirstGroup 
}) => {
  return (
    <div className={isFirstGroup ? '' : 'mt-2 pt-2 border-t'}>
      <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {group.label}
      </div>
      <div className="mt-1">
        {group.items.map((item) => (
          <SuggestionItem
            key={`${item.type}-${item.id}`}
            item={item}
            onClick={onSelectSuggestion}
          />
        ))}
      </div>
    </div>
  );
};

export default SuggestionGroup;
