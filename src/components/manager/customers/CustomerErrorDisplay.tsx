
import CustomerDetailError from '@/components/ui/customer/CustomerDetailError';
import { checkUserExists } from '@/services/auth/userLookupService';
import { useState, useEffect } from 'react';

interface CustomerErrorDisplayProps {
  errorMsg: string;
  onRetry: () => void;
}

const CustomerErrorDisplay = ({ errorMsg, onRetry }: CustomerErrorDisplayProps) => {
  const [userLookupResult, setUserLookupResult] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  // Extract UUID from error message if present
  const uuidMatch = errorMsg.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  const customerId = uuidMatch ? uuidMatch[1] : 'Keine ID gefunden';
  
  // Try to check if the user actually exists
  useEffect(() => {
    const checkUser = async () => {
      if (!customerId || customerId === 'Keine ID gefunden') return;
      
      try {
        setIsChecking(true);
        const result = await checkUserExists(customerId);
        if (result.exists) {
          setUserLookupResult(`ID existiert in der Datenbank (Quelle: ${result.source})`);
        } else {
          setUserLookupResult('ID existiert nicht in der Datenbank');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setUserLookupResult('Fehler bei der Überprüfung der Benutzer-ID');
      } finally {
        setIsChecking(false);
      }
    };
    
    checkUser();
  }, [customerId]);
  
  // Format the error message to be more user-friendly in German
  const formatDbErrorMessage = (msg: string) => {
    // Special case for ID not existing
    if (msg.includes("does not exist") || msg.includes("existiert nicht") || msg.includes("nicht gefunden")) {
      return `Die Kunden-ID "${customerId}" konnte nicht in der Datenbank gefunden werden.
              Bitte überprüfen Sie die ID und stellen Sie sicher, dass sie mit einer der IDs in den Tabellen übereinstimmt.`;
    }
    
    // Special case for ID format issues
    if (msg.includes("not a valid UUID") || msg.includes("keine gültige UUID")) {
      return `Die angegebene ID "${customerId}" hat kein gültiges UUID-Format. 
              Eine gültige UUID muss genau diesem Format entsprechen: 99f4040d-097f-40c6-a533-fde044b03550`;
    }
    
    // Original error formatting logic
    if (msg.includes("infinite recursion") || msg.includes("Database policy error")) {
      return "Datenbankrichtlinienfehler: Wir haben ein Problem mit der Datenzugriffskonfiguration. Unser Team arbeitet an einer Lösung.";
    }
    
    if (msg.includes("User not allowed") || msg.includes("permission denied") || msg.includes("Permission denied")) {
      return "Zugriff verweigert: Sie haben keine Berechtigung, auf diese Kundendaten zuzugreifen.";
    }
    
    if (msg.includes("No customer data found") || msg.includes("Invalid customer ID")) {
      return `Für die ID "${customerId}" wurden keine Kundendaten gefunden. Diese ID scheint ungültig zu sein oder es gibt ein Berechtigungsproblem.`;
    }
    
    return msg;
  };

  const formattedError = formatDbErrorMessage(errorMsg);
  
  // Add debug information to help diagnose the issue
  const debugInfo = (
    <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs text-gray-700 font-mono">
      <p className="mb-1">Debug-Info für Entwickler:</p>
      <p>Aktuelle URL: {window.location.pathname}</p>
      <p>Geprüfte Tabellen: profiles, company_users, user_roles</p>
      <p>Aktuelle ID: {window.location.pathname.split('/').pop()}</p>
      <p>Format-Prüfung: UUID must match pattern like: 99f4040d-097f-40c6-a533-fde044b03550</p>
      <p>ID-Überprüfung: {isChecking ? 'Wird geprüft...' : userLookupResult || 'Nicht geprüft'}</p>
      <p>Tipp: Überprüfen Sie die ID in der URL und stellen Sie sicher, dass sie mit einer vorhandenen Benutzer-ID übereinstimmt</p>
    </div>
  );

  return (
    <>
      <CustomerDetailError 
        error={formattedError} 
        onRetry={onRetry}
      />
      {process.env.NODE_ENV !== 'production' && debugInfo}
    </>
  );
};

export default CustomerErrorDisplay;
