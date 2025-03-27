
import React from 'react';
import { Card } from '@/components/ui/card';

interface EmptySearchStateProps {
  query: string;
}

const EmptySearchState: React.FC<EmptySearchStateProps> = ({ query }) => {
  return (
    <Card className="absolute z-50 top-full mt-1 w-full max-h-96 overflow-y-auto bg-white shadow-lg rounded-md border">
      <div className="p-4 text-gray-500">
        <p>No matches found for "{query}"</p>
        <p className="text-sm mt-1">Try a different search term or browse by category</p>
      </div>
    </Card>
  );
};

export default EmptySearchState;
