
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, AlertTriangle } from 'lucide-react';

interface AccessErrorDisplayProps {
  loading: boolean;
}

const AccessErrorDisplay: React.FC<AccessErrorDisplayProps> = ({ loading }) => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Jobangebote</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64 flex-col gap-4">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Verbindung wird hergestellt...</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold">Zugriff nicht verfügbar</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Sie haben derzeit keinen Zugriff auf die Jobangebote-Funktion. 
                  Bitte kontaktieren Sie Ihren Administrator, um diese Funktion zu aktivieren.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessErrorDisplay;
