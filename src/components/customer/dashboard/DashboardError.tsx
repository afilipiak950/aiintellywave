
import React from 'react';
import { AlertCircle, RefreshCw, Home, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { toast } from "@/hooks/use-toast";

interface DashboardErrorProps {
  error: string;
  onRetry: () => void;
}

const DashboardError: React.FC<DashboardErrorProps> = ({ error, onRetry }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  // Bestimmen des Fehlertyps für eine bessere Fehlerbehandlung
  const isRLSError = error.includes('infinite recursion') || 
                   error.includes('policy') || 
                   error.includes('permission denied');
  
  const isNetworkError = error.includes('network') || 
                       error.includes('connection') || 
                       error.includes('timeout');
  
  const isAuthError = error.includes('authentication') || 
                    error.includes('unauthorized') || 
                    error.includes('not logged in');
  
  // Anzeige einer spezifischen Fehlermeldung basierend auf dem Fehlertyp
  let errorMessage = "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.";
  let actionMessage = "Erneut versuchen";
  let secondaryMessage = "";
  
  if (isRLSError) {
    errorMessage = "Es gibt ein Problem mit den Datenbankberechtigungen. Unsere Entwickler wurden benachrichtigt und arbeiten daran.";
    actionMessage = "Dashboard neu laden";
    secondaryMessage = "Dieses Problem tritt manchmal nach Updates auf und löst sich nach einer Anmeldung.";
  } else if (isNetworkError) {
    errorMessage = "Netzwerkverbindungsproblem. Bitte überprüfen Sie Ihre Internetverbindung.";
  } else if (isAuthError) {
    errorMessage = "Authentifizierungsproblem. Bitte melden Sie sich erneut an.";
    actionMessage = "Zur Anmeldung";
  }
  
  const handleAction = async () => {
    if (isAuthError) {
      try {
        await signOut();
        toast({
          title: "Abgemeldet",
          description: "Sie wurden erfolgreich abgemeldet. Bitte melden Sie sich erneut an.",
        });
        navigate('/login');
      } catch (error) {
        console.error('Fehler beim Abmelden:', error);
        // Trotzdem zur Login-Seite navigieren
        navigate('/login');
      }
    } else if (isRLSError) {
      // Bei RLS-Fehlern versuchen wir, den Benutzer erneut anzumelden
      try {
        await signOut();
        toast({
          title: "Sitzung zurückgesetzt",
          description: "Ihre Sitzung wurde zurückgesetzt. Bitte melden Sie sich erneut an.",
        });
        navigate('/login');
      } catch (error) {
        console.error('Fehler beim Zurücksetzen der Sitzung:', error);
        // Falls das nicht funktioniert, die Seite neu laden
        window.location.reload();
      }
    } else {
      onRetry();
    }
  };
  
  const handleHomeClick = () => {
    navigate('/');
  };
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center mb-6">
      <div className="flex flex-col items-center justify-center gap-3">
        <AlertCircle className="text-red-500 h-10 w-10" />
        <h2 className="text-xl font-semibold text-red-700">Dashboard Fehler</h2>
        <p className="text-red-600 mb-2">{errorMessage}</p>
        
        {secondaryMessage && (
          <p className="text-gray-600 text-sm mb-2">{secondaryMessage}</p>
        )}
        
        {isRLSError && (
          <div className="text-sm text-gray-600 mb-2 max-w-md">
            <p className="mb-1">Technischer Fehler:</p>
            <p className="font-mono text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {error}
            </p>
            <p className="mt-2">
              Dieses Problem tritt auf, wenn die Datenbankrichtlinien in Konflikt geraten. 
              Ein Administrator wurde benachrichtigt.
            </p>
          </div>
        )}
        
        <div className="flex gap-3 mt-2">
          <Button 
            onClick={handleAction}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center gap-2"
          >
            {isAuthError ? <LogIn className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            {actionMessage}
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleHomeClick}
            className="px-4 py-2 rounded inline-flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Startseite
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardError;
