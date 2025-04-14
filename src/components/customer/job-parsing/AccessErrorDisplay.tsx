
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Loader2 } from 'lucide-react';

interface AccessErrorDisplayProps {
  loading: boolean;
}

const AccessErrorDisplay: React.FC<AccessErrorDisplayProps> = ({ loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Lade...</span>
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Kein Zugriff</CardTitle>
        <CardDescription>
          Die Google Jobs Funktion ist für Ihr Konto nicht aktiviert.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center p-6">
          <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="mb-4">
            Bitte kontaktieren Sie Ihren Administrator, um Zugang zu dieser Funktion zu erhalten.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessErrorDisplay;
