
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import TypeBadge from './TypeBadge';
import SourceBadge from './SourceBadge';
import StatusBadge from './StatusBadge';
import InputSourceDisplay from './InputSourceDisplay';
import SearchStringDisplay from './SearchStringDisplay';
import SearchStringActions from './SearchStringActions';

interface SearchStringItemProps {
  searchString: SearchString;
  onOpenDetail: (searchString: SearchString) => void;
  onDeleteSearchString: (id: string) => Promise<void>;
  onCancelSearchString: (id: string) => Promise<void>;
  cancelingId: string | null;
}

const SearchStringItem: React.FC<SearchStringItemProps> = ({ 
  searchString, 
  onOpenDetail, 
  onDeleteSearchString, 
  onCancelSearchString,
  cancelingId
}) => {
  return (
    <div className="p-4 border rounded-md hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-wrap gap-2 mb-2">
          <TypeBadge type={searchString.type} />
          <SourceBadge source={searchString.input_source} />
          <StatusBadge status={searchString.status} />
        </div>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(searchString.created_at), { addSuffix: true })}
        </span>
      </div>
      
      <InputSourceDisplay searchString={searchString} />
      
      <SearchStringDisplay 
        searchString={searchString} 
        onCancelSearchString={onCancelSearchString} 
        cancelingId={cancelingId} 
      />
      
      <SearchStringActions 
        searchString={searchString} 
        onOpenDetail={onOpenDetail} 
        onDelete={onDeleteSearchString} 
      />
    </div>
  );
};

export default SearchStringItem;
