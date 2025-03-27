
import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <Card className="absolute z-50 top-full mt-1 w-full max-h-96 overflow-y-auto bg-white shadow-lg rounded-md border">
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
        <span className="ml-2 text-gray-600">Searching...</span>
      </div>
    </Card>
  );
};

export default LoadingState;
