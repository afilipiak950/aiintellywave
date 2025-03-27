
import { useEffect, useRef } from 'react';

export const CalendlyIntegration = () => {
  const calendlyRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Create Calendly script if it doesn't exist
    const scriptId = 'calendly-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
    
    // Clean up script when component unmounts
    return () => {
      // We don't remove the script because other instances might need it
      // Also, Calendly has its own cleanup
    };
  }, []);
  
  return (
    <div className="calendly-container rounded-xl overflow-hidden shadow-lg">
      <div 
        ref={calendlyRef}
        className="calendly-inline-widget"
        data-url="https://calendly.com/af-intellywave/30min"
        style={{ minWidth: '320px', height: '700px' }}
      />
    </div>
  );
};
