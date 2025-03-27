
import React from 'react';
import { SuggestionItem as SuggestionItemType } from './types';

interface SuggestionItemProps {
  item: SuggestionItemType;
  onClick: (item: SuggestionItemType) => void;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ item, onClick }) => {
  return (
    <div
      className="px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer"
      onClick={() => onClick(item)}
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
  );
};

export default SuggestionItem;
