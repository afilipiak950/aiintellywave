
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Error handler for React 18 errors
window.addEventListener('error', (event) => {
  console.error('Caught in window error handler:', event.error);
});

// Create root and render app
const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
