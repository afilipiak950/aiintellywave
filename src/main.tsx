
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Create a proper global error handler to prevent white screens
const globalErrorHandler = (event: ErrorEvent | PromiseRejectionEvent) => {
  const error = event instanceof ErrorEvent ? event.error : (event as PromiseRejectionEvent).reason;
  console.error('Global error caught:', error);
  
  // Prevent the browser from showing its own error dialog
  event.preventDefault();
  
  // Only show error UI if in production to avoid interfering with dev tools
  if (import.meta.env.PROD) {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; margin-top: 50px;">
          <h2>Something went wrong</h2>
          <p>Please try refreshing the page.</p>
          <button onclick="window.location.reload()" style="padding: 8px 16px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Refresh
          </button>
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
    throw new Error("Root element not found!");
  }
  
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Error during app initialization:', error);
}

