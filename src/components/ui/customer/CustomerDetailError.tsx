
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
  
  // Extract the current URL to show the problematic ID
  const currentPath = window.location.pathname;
  const customerId = currentPath.split('/').pop() || 'Keine ID gefunden';
  
  // Check if the ID matches the UUID format
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId);
  
  // Determine if we should show custom message for known errors
  const errorTitle = error.includes('Kunde nicht gefunden') || error.includes('existiert nicht') ? 'Kunde nicht gefunden' : 
                    error.includes('Kundendaten fehlen') ? 'Kundendaten fehlen' :
                    error.includes('Datenbank') ? 'Datenbankzugriffsfehler' :
                    error.includes('UUID') ? 'Ungültige Kunden-ID' :
                    'Fehler beim Laden des Kunden';
  
  // Provide more helpful German messages 
  let errorMessage = error;
  let additionalInfo = '';
  
  if (error.includes('existiert nicht') || error.includes('not found in any table')) {
    additionalInfo = `Die Kunden-ID '${customerId}' existiert nicht im System. Bitte überprüfen Sie die folgenden Tabellen in der Datenbank: profiles, company_users, user_roles.`;
  } else if (error.includes('UUID')) {
    additionalInfo = `Die ID '${customerId}' ist keine gültige UUID. Bitte verwenden Sie ein korrektes Format wie: 99f4040d-097f-40c6-a533-fde044b03550`;
  }
  
  // If the format is invalid, show this warning
  if (!isValidUUID) {
    additionalInfo = `Achtung: Die ID '${customerId}' im URL entspricht nicht dem erforderlichen UUID-Format. Gültige IDs sehen so aus: 99f4040d-097f-40c6-a533-fde044b03550`;
  }
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">{errorTitle}</h3>
      <p className="text-red-700 mb-2">{errorMessage}</p>
      {additionalInfo && <p className="text-red-600 mb-6 text-sm">{additionalInfo}</p>}
      
      {!isValidUUID && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 mb-6 text-sm text-yellow-800 rounded">
          <p className="font-medium">Ungültige ID im URL erkannt</p>
          <p>Der URL enthält eine ID, die nicht dem UUID-Format entspricht. Gültige IDs haben 32 Zeichen plus 4 Bindestriche.</p>
        </div>
      )}
      
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
