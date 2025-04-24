
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface PipelineErrorProps {
  error: string;
  onRetry: () => void;
  isRefreshing: boolean;
  companyMissing?: boolean;
}

const PipelineError: React.FC<PipelineErrorProps> = ({ 
  error, 
  onRetry, 
  isRefreshing, 
  companyMissing = false 
}) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {companyMissing ? "Unternehmensverbindung fehlt" : "Fehler"}
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{error}</p>
        {!companyMissing && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-fit" 
            onClick={onRetry}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Wird aktualisiert..." : "Erneut versuchen"}
          </Button>
        )}
        {companyMissing && (
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-sm">
              Bitte kontaktieren Sie einen Administrator, um Ihr Benutzerkonto mit einem Unternehmen zu verknüpfen.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-fit" 
              onClick={() => window.location.href = '/customer/dashboard'}
            >
              Zurück zum Dashboard
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default PipelineError;
