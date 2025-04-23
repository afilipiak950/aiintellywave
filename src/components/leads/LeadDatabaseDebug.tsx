
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Database, RefreshCw } from 'lucide-react';

interface LeadDatabaseDebugProps {
  info: any;
  error: Error | null;
  onRefreshData?: () => void;
}

const LeadDatabaseDebug = ({ info, error, onRefreshData }: LeadDatabaseDebugProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTab, setCurrentTab] = useState('error');
  
  const handleClearCache = () => {
    // Clear all lead/project related caches
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('cached_leads_') || key.startsWith('cached_projects'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    alert('Cache wurde gelöscht.');
    
    if (onRefreshData) {
      onRefreshData();
    }
  };
  
  return (
    <div className="mt-4 border rounded-md overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 bg-muted cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <h3 className="text-sm font-medium">Diagnose Informationen</h3>
        </div>
        <Button variant="ghost" size="sm">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-3 text-xs">
          <div className="flex gap-2 mb-3">
            <Button 
              size="sm" 
              variant={currentTab === 'error' ? 'default' : 'outline'} 
              onClick={() => setCurrentTab('error')}
            >
              Fehler
            </Button>
            <Button 
              size="sm" 
              variant={currentTab === 'connection' ? 'default' : 'outline'} 
              onClick={() => setCurrentTab('connection')}
            >
              Verbindung
            </Button>
            <Button 
              size="sm" 
              variant={currentTab === 'cache' ? 'default' : 'outline'} 
              onClick={() => setCurrentTab('cache')}
            >
              Cache
            </Button>
          </div>
          
          {currentTab === 'error' && error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <h4 className="font-semibold text-red-700 mb-1">Datenbankfehler</h4>
              <p className="text-red-600 mb-2">{error.message}</p>
              <p className="text-xs text-red-500 overflow-auto max-h-20">
                Stack: {error.stack || 'Kein Stack verfügbar'}
              </p>
            </div>
          )}
          
          {currentTab === 'error' && !error && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700">Keine Fehler aufgetreten.</p>
            </div>
          )}
          
          {currentTab === 'connection' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-semibold mb-1">Verbindungsinformationen</h4>
              <div className="space-y-1">
                <p>Angemeldet: {info?.isAuthenticated ? 'Ja' : 'Nein'}</p>
                <p>Benutzer: {info?.userEmail || 'Unbekannt'}</p>
                <p>Netzwerke: {navigator.onLine ? 'Online' : 'Offline'}</p>
                <p>Zeitstempel: {info?.timestamp || new Date().toISOString()}</p>
              </div>
            </div>
          )}
          
          {currentTab === 'cache' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <h4 className="font-semibold mb-1">Cache Informationen</h4>
              <div className="space-y-1 mb-3">
                <p>Browser: {info?.browserInfo?.userAgent || navigator.userAgent}</p>
                <p>Plattform: {info?.browserInfo?.platform || navigator.platform}</p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearCache} 
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Cache leeren
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadDatabaseDebug;
