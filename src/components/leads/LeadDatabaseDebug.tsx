
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Database, RefreshCw, AlertCircle, Trash } from 'lucide-react';
import { preloadProjectsInBackground } from './lead-error-utils';

interface LeadDatabaseDebugProps {
  info: any;
  error: Error | null;
  onRefreshData?: () => void;
}

const LeadDatabaseDebug = ({ info, error, onRefreshData }: LeadDatabaseDebugProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTab, setCurrentTab] = useState('error');
  const [clearingCache, setClearingCache] = useState(false);
  
  const handleClearCache = () => {
    setClearingCache(true);
    
    try {
      // Clear all lead/project related caches
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('cached_leads_') || key.startsWith('cached_projects'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_timestamp`);
      });
      
      // Show number of items cleared
      alert(`Cache wurde gelöscht (${keysToRemove.length} Einträge).`);
      
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (e) {
      console.error('Error clearing cache:', e);
      alert('Fehler beim Löschen des Caches.');
    } finally {
      setClearingCache(false);
    }
  };

  const handleForceRefresh = () => {
    // Clear cache and refresh
    handleClearCache();
    // Pre-warm the cache in background
    preloadProjectsInBackground();
  };
  
  return (
    <div className="mt-4 border rounded-md overflow-hidden bg-white">
      <div 
        className="flex items-center justify-between p-3 bg-muted cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <h3 className="text-sm font-medium">Diagnose Informationen</h3>
          {error && <AlertCircle className="h-4 w-4 text-red-500" />}
        </div>
        <Button variant="ghost" size="sm">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-3 text-xs">
          <div className="flex gap-2 mb-3 overflow-x-auto">
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
            <Button 
              size="sm" 
              variant={currentTab === 'troubleshooting' ? 'default' : 'outline'} 
              onClick={() => setCurrentTab('troubleshooting')}
            >
              Fehlersuche
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
                <p>Benutzer ID: {info?.userId ? info.userId.substring(0, 8) + '...' : 'Unbekannt'}</p>
                <p>Netzwerk: {info?.browserInfo?.online ? 'Online' : 'Offline'}</p>
                <p>Zeitstempel: {info?.timestamp || new Date().toISOString()}</p>
              </div>
            </div>
          )}
          
          {currentTab === 'cache' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <h4 className="font-semibold mb-1">Cache Informationen</h4>
              <div className="space-y-2 mb-3">
                <p className="text-sm text-amber-700">Der Cache wird verwendet, um die Ladezeiten zu verbessern und Datenbankfehler zu umgehen.</p>
                
                {/* Cache status */}
                {info?.cacheStatus && Object.keys(info.cacheStatus).length > 0 ? (
                  <div className="rounded bg-white p-2 border border-amber-100 text-xs">
                    <h5 className="font-medium mb-1">Cache Status:</h5>
                    {Object.entries(info.cacheStatus).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-2">
                        <span className="font-mono truncate">{key.replace('cached_', '')}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs">Kein Cache vorhanden.</p>
                )}
              </div>
              
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearCache} 
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  disabled={clearingCache}
                >
                  <Trash className="mr-2 h-3.5 w-3.5" />
                  Cache leeren
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleForceRefresh} 
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  disabled={clearingCache}
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Neu laden
                </Button>
              </div>
            </div>
          )}

          {currentTab === 'troubleshooting' && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
              <h4 className="font-semibold mb-1">Fehlerbehebung</h4>
              <div className="space-y-2 mb-3 text-xs">
                <p>Wenn Daten nicht angezeigt werden:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Versuchen Sie die Seite neu zu laden</li>
                  <li>Leeren Sie den Cache und laden Sie neu</li>
                  <li>Prüfen Sie Ihre Internetverbindung</li>
                  <li>Falls das Problem weiterhin besteht, kontaktieren Sie den Support</li>
                </ol>
              </div>
              
              <div className="mt-2 p-2 bg-white border border-purple-100 rounded">
                <p className="text-xs mb-1"><strong>Häufige Fehler:</strong></p>
                <ul className="list-disc ml-4 text-xs">
                  <li><strong>RLS Policy Error:</strong> Datenbankzugriffsrechte fehlen</li>
                  <li><strong>Infinite Recursion:</strong> Problem mit DB-Richtlinien</li>
                  <li><strong>Empty Results:</strong> Keine Projekte zugewiesen oder Berechtigung fehlt</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadDatabaseDebug;
