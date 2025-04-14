
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

const SearchStringsLoading: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Strings</CardTitle>
        <CardDescription>Manage customer-generated search strings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-24" />
          <Skeleton className="w-full h-24" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchStringsLoading;
