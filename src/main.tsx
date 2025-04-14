
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

// Configure Query Client with better defaults for better caching and performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 1, // Only retry failed queries once
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
      // Detailed error handler logs all query errors
      meta: {
        error: (err: any) => {
          console.error('Query error:', err);
          return err;
        }
      }
    },
  },
});

// Wrap root creation in try/catch
try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error("Root element not found!");
  }
  
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
} catch (error) {
  console.error('Error during app initialization:', error);
}
