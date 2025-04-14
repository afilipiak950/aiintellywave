
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle, Globe, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UrlInputFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  initialUrl?: string;
  onUrlChange?: (url: string) => void;
  onCancel?: () => void;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ 
  onSubmit, 
  isLoading,
  initialUrl = '',
  onUrlChange,
  onCancel
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);
  
  // Update internal state when initialUrl changes
  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  // Track processing time for jobs that take too long
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      const startTime = Date.now();
      timer = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000 / 60); // in minutes
        setProcessingTime(elapsedTime);
      }, 30000); // Update every 30 seconds
    } else {
      setProcessingTime(0);
      if (timer) clearInterval(timer);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);

  const validateUrl = (input: string): boolean => {
    // Improve URL validation
    try {
      // Add protocol if missing
      const urlToValidate = input.match(/^https?:\/\//) ? input : `https://${input}`;
      new URL(urlToValidate);
      
      // Additional check for domain-like format
      const domainRegex = /^(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+([\/\?#].*)?$/i;
      return domainRegex.test(urlToValidate);
    } catch (e) {
      return false;
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    // Simple validation
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }
    
    // Validate URL format
    if (!validateUrl(url)) {
      setError('Please enter a valid URL (e.g., example.com or https://example.com)');
      return;
    }
    
    // Normalize URL (add protocol if missing)
    let normalizedUrl = url;
    if (!url.match(/^https?:\/\//)) {
      normalizedUrl = `https://${url}`;
    }
    
    // Submit valid URL
    onSubmit(normalizedUrl);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (onUrlChange) {
      onUrlChange(newUrl);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8"
    >
      <h2 className="text-xl font-semibold mb-4">Enter Website to Analyze</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="example.com or https://example.com"
              className={`pl-10 ${error ? 'border-red-500 dark:border-red-400' : ''}`}
              disabled={isLoading}
            />
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          {processingTime > 5 && isLoading && (
            <div className="flex items-center gap-2 text-amber-500 text-sm mt-2">
              <AlertCircle size={16} />
              <span>Processing is taking longer than expected ({processingTime} minutes). This may be due to complex website content or heavy load.</span>
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={onCancel}
                  className="ml-2 text-xs px-2 py-1 h-auto"
                >
                  <RefreshCw size={12} className="mr-1" /> Cancel
                </Button>
              )}
            </div>
          )}
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter any public website URL to analyze its content and generate AI summaries and FAQs
          </p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Search size={16} />
              </motion.div>
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search size={16} />
              Fetch & Summarize
            </span>
          )}
        </Button>
      </form>
    </motion.div>
  );
};
