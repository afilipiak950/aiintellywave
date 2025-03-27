
import React from 'react';
import { Card } from '@/components/ui/card';

interface ErrorStateProps {
  error: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <Card className="absolute z-50 top-full mt-1 w-full max-h-96 overflow-y-auto bg-white shadow-lg rounded-md border">
      <div className="text-red-500 p-4">{error}</div>
    </Card>
  );
};

export default ErrorState;
