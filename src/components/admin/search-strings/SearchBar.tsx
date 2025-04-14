
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, User } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  userEmailToCheck?: string;
  setUserEmailToCheck?: (value: string) => void;
  onCheckUser?: () => Promise<void>;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  onRefresh, 
  isRefreshing,
  userEmailToCheck,
  setUserEmailToCheck,
  onCheckUser
}) => {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search search strings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={onRefresh} 
          disabled={isRefreshing}
          size="icon"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {setUserEmailToCheck && onCheckUser && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Check user by email..."
              value={userEmailToCheck || ''}
              onChange={(e) => setUserEmailToCheck(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button 
            variant="secondary" 
            onClick={onCheckUser} 
            disabled={isRefreshing}
            size="default"
          >
            <User className="h-4 w-4 mr-2" />
            Check User
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
