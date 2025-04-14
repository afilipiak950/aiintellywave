
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, User, Bug } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  userEmailToCheck?: string;
  setUserEmailToCheck?: (value: string) => void;
  onCheckUser?: () => Promise<void>;
  onDebugUser?: () => Promise<void>;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  onRefresh, 
  isRefreshing,
  userEmailToCheck,
  setUserEmailToCheck,
  onCheckUser,
  onDebugUser
}) => {
  return (
    <div className="w-full space-y-4">
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
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
          <div className="relative flex-1 w-full">
            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Check user by email..."
              value={userEmailToCheck || ''}
              onChange={(e) => setUserEmailToCheck(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button 
              variant="secondary" 
              onClick={onCheckUser} 
              disabled={isRefreshing}
              className="whitespace-nowrap"
            >
              <User className="h-4 w-4 mr-2" />
              Check User
            </Button>
            
            {onDebugUser && (
              <Button 
                variant="destructive" 
                onClick={onDebugUser}
                disabled={isRefreshing}
                className="whitespace-nowrap"
              >
                <Bug className="h-4 w-4 mr-2" />
                Debug User ID
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
