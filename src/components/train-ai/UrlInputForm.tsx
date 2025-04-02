
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UrlInputFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  initialUrl?: string;
  onUrlChange?: (url: string) => void;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ 
  onSubmit, 
  isLoading,
  initialUrl = '',
  onUrlChange
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  
  // Update internal state when initialUrl changes
  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

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
