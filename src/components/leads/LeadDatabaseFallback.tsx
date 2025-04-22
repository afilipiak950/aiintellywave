
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LeadDatabaseFallbackProps {
  message?: string;
}

const LeadDatabaseFallback: React.FC<LeadDatabaseFallbackProps> = ({ 
  message = "Loading lead database..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground text-center max-w-md">{message}</p>
      <p className="text-xs text-muted-foreground mt-2">If this takes too long, try refreshing the page</p>
    </div>
  );
};

export default LeadDatabaseFallback;
