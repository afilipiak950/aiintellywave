
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bug, ChevronDown, ChevronUp, Database, User, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeadDatabaseDebugProps {
  info: any;
  error: Error | null;
}

const LeadDatabaseDebug = ({ info, error }: LeadDatabaseDebugProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="mt-4 border rounded-md overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 bg-muted cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4" />
          <h3 className="text-sm font-medium">Diagnose Informationen</h3>
          {error && (
            <Badge variant="destructive" className="text-xs">Error</Badge>
          )}
        </div>
        <Button variant="ghost" size="sm">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-3 text-xs">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <h4 className="font-semibold text-red-700 mb-1">Database Error</h4>
              <p className="text-red-600">{error.message}</p>
              {error.stack && (
                <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto max-h-32">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 p-3 border rounded bg-blue-50/30">
              <div className="flex items-center gap-1 mb-2">
                <User className="h-3.5 w-3.5" />
                <h4 className="font-semibold">Benutzer-Informationen</h4>
              </div>
              <p>
                <span className="inline-block w-32">Authentifiziert:</span> 
                {info?.isAuthenticated ? 'Ja' : 'Nein'}
              </p>
              <p>
                <span className="inline-block w-32">Benutzer-ID:</span> 
                <span className="font-mono text-xs">{info?.userId || 'Nicht verfügbar'}</span>
              </p>
              <p>
                <span className="inline-block w-32">E-Mail:</span> 
                {info?.userEmail || 'Nicht verfügbar'}
              </p>
            </div>
            
            <div className="space-y-2 p-3 border rounded bg-green-50/30">
              <div className="flex items-center gap-1 mb-2">
                <Database className="h-3.5 w-3.5" />
                <h4 className="font-semibold">Projekte & Leads</h4>
              </div>
              <p>
                <span className="inline-block w-32">Projekte gefunden:</span> 
                {info?.projectsFound || 0}
              </p>
              {info?.projectsError && (
                <p className="text-red-500 text-xs">Error: {info.projectsError}</p>
              )}
              <p>
                <span className="inline-block w-32">Leads-Zugriff:</span> 
                {info?.canAccessLeads ? 'Ja' : 'Nein'}
              </p>
              <p>
                <span className="inline-block w-32">Leads Anzahl:</span> 
                {info?.leadsCount || 0}
              </p>
              {info?.leadsError && (
                <p className="text-red-500 text-xs">Error: {info.leadsError}</p>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-3 border rounded bg-muted/30">
            <div className="flex items-center gap-1 mb-2">
              <Lock className="h-3.5 w-3.5" />
              <h4 className="font-semibold">Zugriffsrechte-Diagnose</h4>
            </div>
            
            {info?.leadsError?.includes('infinite recursion') && (
              <div className="text-amber-800 bg-amber-50 p-2 rounded text-xs mb-3">
                Es wurde ein "Infinite Recursion" Fehler erkannt. Dies deutet auf ein Problem mit den Datenbankzugriffsrichtlinien hin.
                Bitte teilen Sie diesen Fehler dem Support mit.
              </div>
            )}
            
            <div className="text-xs space-y-2">
              <p>
                <strong>Benutzerrolle:</strong> {info?.userRole || 'Unbekannt'}
              </p>
              <p>
                <strong>Direkter Projektzugriff:</strong> {info?.directProjectAccess ? 'Erfolgreich' : 'Fehlgeschlagen'}
              </p>
              <p>
                <strong>Direkter Leads-Zugriff:</strong> {info?.directLeadAccess ? 'Erfolgreich' : 'Fehlgeschlagen'}
              </p>
            </div>
          </div>
          
          {/* Only show raw debug data when expanded */}
          <details className="mt-4">
            <summary className="font-semibold mb-1 cursor-pointer">Vollständige Diagnostikdaten</summary>
            <pre className="p-2 bg-muted rounded overflow-auto max-h-48 text-xs">
              {JSON.stringify(info, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default LeadDatabaseDebug;
