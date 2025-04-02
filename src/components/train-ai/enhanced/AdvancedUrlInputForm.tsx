
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, AlertCircle, Search, ArrowRight, CheckCircle, History } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AdvancedUrlInputFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  initialUrl?: string;
  onUrlChange?: (url: string) => void;
}

export const AdvancedUrlInputForm: React.FC<AdvancedUrlInputFormProps> = ({ 
  onSubmit, 
  isLoading,
  initialUrl = '',
  onUrlChange
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [recentUrls] = useState<string[]>([
    'example.com',
    'wikipedia.org',
    'docs.google.com'
  ]);
  
  // Example status from validation
  const [urlStatus, setUrlStatus] = useState<'none' | 'valid' | 'invalid'>('none');
  
  // Update internal state when initialUrl changes
  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    if (url) {
      const timer = setTimeout(() => {
        validateUrl(url);
      }, 500); // Debounce validation
      
      return () => clearTimeout(timer);
    }
  }, [url]);

  const validateUrl = (input: string): boolean => {
    // Clear previous errors
    setError(null);
    
    if (!input.trim()) {
      setUrlStatus('none');
      return false;
    }
    
    // Improve URL validation
    try {
      // Add protocol if missing
      const urlToValidate = input.match(/^https?:\/\//) ? input : `https://${input}`;
      new URL(urlToValidate);
      
      // Additional check for domain-like format
      const domainRegex = /^(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+([\/\?#].*)?$/i;
      const isValid = domainRegex.test(urlToValidate);
      
      setUrlStatus(isValid ? 'valid' : 'invalid');
      if (!isValid) {
        setError('Please enter a valid URL (e.g., example.com or https://example.com)');
        return false;
      }
      
      return true;
    } catch (e) {
      setUrlStatus('invalid');
      setError('Please enter a valid URL (e.g., example.com or https://example.com)');
      return false;
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL format
    if (!validateUrl(url)) {
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
    
    if (!newUrl.trim()) {
      setUrlStatus('none');
      setError(null);
    }
  };
  
  const selectRecentUrl = (recentUrl: string) => {
    setUrl(recentUrl);
    if (onUrlChange) {
      onUrlChange(recentUrl);
    }
    validateUrl(recentUrl);
  };
  
  return (
    <Card className="border border-indigo-100 dark:border-indigo-900/30 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Globe className="h-5 w-5 text-indigo-500" />
          Website Analysis
        </CardTitle>
        <CardDescription>
          Enter any website URL to analyze its content and generate AI insights
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="Enter website URL (e.g., example.com)"
                className={`pl-10 pr-10 ${error ? 'border-red-300 dark:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isLoading}
              />
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              
              {urlStatus === 'valid' && url && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              
              {urlStatus === 'invalid' && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
              )}
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 text-red-500 text-sm"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" type="button" className="flex items-center gap-1 text-xs">
                  <History size={14} />
                  <span>Recent</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="space-y-1">
                  {recentUrls.map((recentUrl) => (
                    <Button
                      key={recentUrl}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => selectRecentUrl(recentUrl)}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      {recentUrl}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isLoading || urlStatus === 'invalid'}
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
                  Analyze Website
                  <ArrowRight size={16} />
                </span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
