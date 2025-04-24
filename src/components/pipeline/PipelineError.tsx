
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast';

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
  // Show error as toast instead of alert
  React.useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: companyMissing ? "Unternehmensverbindung fehlt" : "Fehler",
        description: error,
      });
    }
  }, [error, companyMissing]);

  // Return null instead of showing error alert
  return null;
};

export default PipelineError;
