
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface SearchStringsHeaderProps {
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
}

const SearchStringsHeader: React.FC<SearchStringsHeaderProps> = ({ onRefresh, isRefreshing }) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div>
        <CardTitle>Your Search Strings</CardTitle>
        <CardDescription>View and manage your saved search strings</CardDescription>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-1"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
      </Button>
    </CardHeader>
  );
};

export default SearchStringsHeader;
