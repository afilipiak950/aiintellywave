
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from './StatusBadge';
import SourceBadge from './SourceBadge';
import TypeBadge from './TypeBadge';
import SearchStringDisplay from './SearchStringDisplay';
import SearchStringActions from './SearchStringActions';

interface SearchStringItemProps {
  searchString: SearchString;
  onOpenDetail: (searchString: SearchString) => void;
  onDelete: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onRetry: (searchString: SearchString) => Promise<void>;
  cancelingId: string | null;
}

const SearchStringItem: React.FC<SearchStringItemProps> = ({ 
  searchString, 
  onOpenDetail, 
  onDelete,
  onCancel,
  onRetry,
  cancelingId
}) => {
  const getFormattedDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={searchString.status} />
            <SourceBadge source={searchString.input_source} />
            <TypeBadge type={searchString.type} />
          </div>
          <div className="text-xs text-gray-500">
            {getFormattedDate(searchString.created_at)}
          </div>
        </div>
        
        <SearchStringDisplay 
          searchString={searchString} 
          onCancelSearchString={onCancel}
          cancelingId={cancelingId}
        />
        
        <SearchStringActions 
          searchString={searchString} 
          onOpenDetail={onOpenDetail} 
          onDelete={onDelete}
          onRetry={onRetry}
        />
      </CardContent>
    </Card>
  );
};

export default SearchStringItem;
