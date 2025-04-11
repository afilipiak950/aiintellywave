
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomerDetailErrorProps {
  error: string;
  onRetry: () => void;
  onBack?: () => void;
}

const CustomerDetailError = ({ error, onRetry, onBack }: CustomerDetailErrorProps) => {
  const navigate = useNavigate();
  
  // Determine if we should show custom message for known errors
  const errorTitle = error.includes('does not exist') || error.includes('not found in any table') ? 'Kunde nicht gefunden' : 
                    error.includes('No customer data found') ? 'Kundendaten fehlen' :
                    error.includes('missing database records') ? 'Kundendaten fehlen' :
                    error.includes('RLS policy') ? 'Datenbankzugriffsfehler' :
                    'Fehler beim Laden des Kunden';
  
  // Provide more helpful messages based on error type
  let errorMessage = '';
  let additionalInfo = '';
  
  if (error.includes('does not exist') || error.includes('not found in any table')) {
    errorMessage = 'Die Kunden-ID, auf die Sie zugreifen möchten, existiert nicht im System.';
    additionalInfo = 'Der Kunde wurde möglicherweise gelöscht oder die URL ist falsch.';
  } else if (error.includes('No customer data found') || error.includes('missing database records')) {
    errorMessage = 'Der Kunde existiert, aber es wurden keine Daten gefunden.';
    additionalInfo = 'Dies könnte auf fehlende Datenbankeinträge oder unzureichende Berechtigungen zurückzuführen sein.';
  } else if (error.includes('Error fetching profile')) {
    errorMessage = 'Es gab ein Problem beim Abrufen der Profildaten dieses Kunden.';
    additionalInfo = 'Überprüfen Sie auf Datenbankverbindungsprobleme oder fehlende Tabellen.';
  } else if (error.includes('infinite recursion') || error.includes('RLS policy') || error.includes('Database policy error')) {
    errorMessage = 'Datenbankzugriffsrichtlinienfehler.';
    additionalInfo = 'Möglicherweise gibt es ein Problem mit den Row-Level-Security-Richtlinien. Wenden Sie sich an Ihren Administrator.';
  } else if (error.includes('User not allowed') || error.includes('not allowed to perform this action') || error.includes('Permission denied')) {
    errorMessage = 'Zugriff verweigert.';
    additionalInfo = 'Sie haben keine Berechtigung, auf die Informationen dieses Kunden zuzugreifen. Wenden Sie sich an einen Administrator.';
  } else {
    errorMessage = error;
  }
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">{errorTitle}</h3>
      <p className="text-red-700 mb-2">{errorMessage}</p>
      {additionalInfo && <p className="text-red-600 mb-6 text-sm">{additionalInfo}</p>}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={onRetry}
          className="flex items-center justify-center gap-2"
        >
          Erneut versuchen
        </Button>
        {onBack ? (
          <Button 
            onClick={onBack}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            Zurück zur Kundenliste
          </Button>
        ) : (
          <Button 
            onClick={() => navigate('/admin/customers')}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            Zurück zur Kundenliste
          </Button>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailError;
