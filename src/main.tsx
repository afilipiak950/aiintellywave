
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Verbesserte Fehlermeldungen auf Deutsch
const errorMessages = {
  default: "Es ist ein unerwarteter Fehler aufgetreten",
  network: "Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung",
  database: "Datenbankverbindungsproblem. Versuchen Sie es später erneut",
  auth: "Authentifizierungsproblem. Bitte melden Sie sich erneut an",
  rls: "Datenbankberechtigungsproblem. Bitte melden Sie sich erneut an"
};

// Funktion um den Fehlertyp zu erkennen
const getErrorType = (error: any): string => {
  const errorMessage = error?.message || String(error);
  
  if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('fetch')) {
    return 'network';
  }
  if (errorMessage.includes('database') || errorMessage.includes('supabase') || errorMessage.includes('query')) {
    return 'database';
  }
  if (errorMessage.includes('auth') || errorMessage.includes('login') || errorMessage.includes('credentials')) {
    return 'auth';
  }
  if (errorMessage.includes('infinite recursion') || errorMessage.includes('policy')) {
    return 'rls';
  }
  
  return 'default';
};

// Create a proper global error handler to prevent white screens
const globalErrorHandler = (event: ErrorEvent | PromiseRejectionEvent) => {
  const error = event instanceof ErrorEvent ? event.error : (event as PromiseRejectionEvent).reason;
  console.error('Global error caught:', error);
  
  // Prevent the browser from showing its own error dialog
  event.preventDefault();
  
  // Only show error UI if in production to avoid interfering with dev tools
  if (import.meta.env.PROD) {
    const rootElement = document.getElementById("root");
    const errorType = getErrorType(error);
    const errorMessage = errorMessages[errorType as keyof typeof errorMessages] || errorMessages.default;
    
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; margin-top: 50px; font-family: system-ui, sans-serif;">
          <h2 style="color: #d63031; margin-bottom: 16px;">Etwas ist schiefgelaufen</h2>
          <p style="margin-bottom: 20px; color: #2d3436;">${errorMessage}</p>
          <p style="margin-bottom: 20px; font-size: 14px; color: #636e72;">
            Fehler-ID: ${Date.now().toString(36)}
          </p>
          <button onclick="window.location.href='/'" style="margin-right: 12px; padding: 8px 16px; background: #0984e3; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Startseite
          </button>
          <button onclick="window.location.reload()" style="padding: 8px 16px; background: #ffffff; color: #0984e3; border: 1px solid #0984e3; border-radius: 4px; cursor: pointer;">
            Neu laden
          </button>
          
          ${errorType === 'rls' ? `
            <div style="margin-top: 20px; padding: 12px; background: #f8f9fa; border-radius: 4px; text-align: left;">
              <p style="font-size: 12px; color: #636e72;">Technische Details: ${String(error).substring(0, 150)}...</p>
            </div>
          ` : ''}
        </div>
      `;
    }
  }
};

// Handle both error types
window.addEventListener('error', globalErrorHandler);
window.addEventListener('unhandledrejection', globalErrorHandler);

// Wrap root creation in try/catch
try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error("Root-Element nicht gefunden. Dies könnte ein Browserproblem sein.");
  }
  
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Fehler bei der App-Initialisierung:', error);
  globalErrorHandler(new ErrorEvent('error', { error }));
}
