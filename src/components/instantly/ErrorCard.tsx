
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorCardProps {
  title: string;
  error: Error;
  onRetry: () => void;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ title, error, onRetry }) => {
  return (
    <Card className="bg-destructive/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{error.message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onRetry}
        >
          Retry
        </Button>
      </CardContent>
    </Card>
  );
};

export default ErrorCard;
