
import { useEffect } from 'react';

export function useProgressSimulation(
  isLoading: boolean,
  activeJobId: string | null,
  setProgress: (cb: (prevProgress: number) => number) => void,
  setStage: (stage: string) => void
) {
  // Simulate progress when loading
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isLoading && !activeJobId) {
      setProgress(() => 0);
      
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          const increment = prevProgress < 30 ? 1 : 
                          prevProgress < 60 ? 0.7 : 
                          prevProgress < 85 ? 0.4 : 0.2;
                          
          const newProgress = prevProgress + increment;
          
          if (newProgress < 30) {
            setStage('Crawling Website');
          } else if (newProgress < 60) {
            setStage('Analyzing Content');
          } else if (newProgress < 85) {
            setStage('Generating AI Summary');
          } else {
            setStage('Creating FAQs');
          }
          
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 200);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, activeJobId, setProgress, setStage]);
}
