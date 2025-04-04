
import React from 'react';
import { Card } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    </Card>
  );
};
