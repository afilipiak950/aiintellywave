
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface RevenueChartsViewProps {
  error?: string | null;
}

const RevenueChartsView: React.FC<RevenueChartsViewProps> = ({ error }) => {
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Charts</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-center items-center h-64 text-muted-foreground">
          <p className="text-center">Charts view is under development. Check back soon!</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChartsView;
