
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw, Database, Settings, AlertCircle } from 'lucide-react';

interface LeadDatabaseFallbackProps {
  message?: string;
  error?: Error | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  onMigrate?: () => void;
}

const LeadDatabaseFallback: React.FC<LeadDatabaseFallbackProps> = ({ 
  message = "Wir haben Probleme beim Laden Ihrer Leads",
  error = null,
  onRetry,
  isRetrying = false,
  onMigrate
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 min-h-[50vh]">
      <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
        {error ? (
          <AlertCircle className="h-12 w-12 text-amber-600" />
        ) : (
          <Database className="h-12 w-12 text-blue-600" />
        )}
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">{message}</h2>
      
      <p className="text-gray-600 text-center max-w-md mb-6">
        {error ? (
          <>
            Fehler: {error.message || 'Unbekannter Fehler'}. 
            <br />
            Möglicherweise liegt ein Problem mit Ihrer Kontoeinrichtung oder dem Datenbankzugriff vor.
          </>
        ) : (
          'Möglicherweise liegt ein Problem mit Ihrer Kontoeinrichtung oder dem Datenbankzugriff vor. Versuchen Sie die Seite zu aktualisieren, oder wenden Sie sich an den Support, wenn dieses Problem weiterhin besteht.'
        )}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md w-full">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 h-auto py-3"
          onClick={onRetry || (() => window.location.reload())}
          disabled={isRetrying}
        >
          <RefreshCw className={`h-5 w-5 ${isRetrying ? 'animate-spin' : ''}`} />
          <div className="text-left">
            <div className="font-medium">Seite aktualisieren</div>
            <div className="text-xs text-gray-500">Die Anwendung neu laden</div>
          </div>
        </Button>
        
        {onMigrate && (
          <Button 
            variant="outline"
            className="flex items-center gap-2 h-auto py-3"
            onClick={onMigrate}
          >
            <Database className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Excel migrieren</div>
              <div className="text-xs text-gray-500">Excel-Daten zu Leads konvertieren</div>
            </div>
          </Button>
        )}
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2 h-auto py-3"
          onClick={() => window.location.href = '/customer/projects'}
        >
          <FileText className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Projekte</div>
            <div className="text-xs text-gray-500">Ihre Projekte anzeigen</div>
          </div>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2 h-auto py-3 sm:col-span-2"
          onClick={() => window.location.href = '/customer/settings'}
        >
          <Settings className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Einstellungen</div>
            <div className="text-xs text-gray-500">Ihre Kontoeinstellungen prüfen</div>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default LeadDatabaseFallback;
