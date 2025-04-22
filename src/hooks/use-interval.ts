
import { useEffect, useRef } from 'react';

/**
 * Custom hook for safely using setInterval in React components.
 * If delay is null, the interval is paused.
 *
 * @param callback Function to call every interval
 * @param delay Interval in milliseconds, or null to pause
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();
  
  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // Set up the interval.
  useEffect(() => {
    // Don't schedule if delay is null
    if (delay === null) {
      return;
    }
    
    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };
    
    const id = setInterval(tick, delay);
    
    // Cleanup on unmount or when delay changes
    return () => clearInterval(id);
  }, [delay]);
}
