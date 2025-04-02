
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, Clock, AlertCircle, FileText, HelpCircle, ChevronRight, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FAQ } from '@/components/train-ai/FAQAccordion';

interface EnhancedTrainAIResultsProps {
  jobStatus: 'idle' | 'processing' | 'completed' | 'failed';
  summary: string;
  url: string;
  faqs: FAQ[];
  pageCount: number;
  selectedFilesCount: number;
  handleRetrain: () => void;
  isLoading: boolean;
}

export const EnhancedTrainAIResults: React.FC<EnhancedTrainAIResultsProps> = ({
  jobStatus,
  summary,
  url,
  faqs,
  pageCount,
  selectedFilesCount,
  handleRetrain,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Filter FAQs based on search term
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = !activeCategory || 
      (faq.category || 'General') === activeCategory;
      
    return matchesSearch && matchesCategory;
  });
  
  // Group FAQs by category
  const faqsByCategory = React.useMemo(() => {
    return filteredFaqs.reduce((acc, faq) => {
      const category = faq.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(faq);
      return acc;
    }, {} as Record<string, FAQ[]>);
  }, [filteredFaqs]);
  
  // Get unique categories
  const categories = React.useMemo(() => {
    const categoryMap = faqs.reduce((acc, faq) => {
      const category = faq.category || 'General';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryMap).map(([name, count]) => ({ name, count }));
  }, [faqs]);
  
  // Toggle FAQ expansion
  const toggleFaq = (id: string) => {
    setExpandedFaqs(prev => ({...prev, [id]: !prev[id]}));
  };
  
  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setActiveCategory(null);
  };
  
  // Format summary
  const formattedSummary = summary ? summary.split('\n').filter(Boolean).map((paragraph, index) => (
    <p key={index} className="mb-4">{paragraph}</p>
  )) : [];

  // Show loading skeleton if processing
  if (jobStatus === 'processing') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Analysis Results</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Clock size={14} className="mr-1" />
              Processing
            </Badge>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Processing website content...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
            <CardDescription>Generating questions and answers...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show error message if failed
  if (jobStatus === 'failed') {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center p-6">
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Processing Failed</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an error while analyzing the content. Please try again or contact support if the problem persists.
            </p>
            <Button
              onClick={handleRetrain}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show results if completed
  if (jobStatus === 'completed' && (summary || faqs.length > 0)) {
    const domain = url ? new URL(url).hostname : '';
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Analysis Results</h2>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle size={14} className="mr-1" />
              Complete
            </Badge>
          </div>
          
          <Button
            variant="outline"
            onClick={handleRetrain}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "Processing..." : "Retrain AI"}
          </Button>
        </div>
        
        {domain && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Analysis for: <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{domain}</a>
          </div>
        )}
        
        {/* Summary Card */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <CardTitle>AI Summary</CardTitle>
                </div>
                {domain && (
                  <CardDescription>
                    Generated for: {domain}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose dark:prose-invert max-w-none">
                  {formattedSummary}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* FAQ Card */}
        {faqs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-md">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-indigo-500" />
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {filteredFaqs.length} of {faqs.length} Questions
                  </Badge>
                </div>
                <CardDescription>
                  AI-generated questions and answers
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                {/* Search and filtering */}
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search questions or answers..."
                      className="pl-10"
                    />
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    />
                    {(searchTerm || activeCategory) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 text-gray-500"
                        onClick={clearFilters}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  {categories.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setActiveCategory(null)}
                        size="sm"
                        variant={activeCategory === null ? "default" : "outline"}
                        className={activeCategory === null
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : ""
                        }
                      >
                        All ({faqs.length})
                      </Button>
                      {categories.map(category => (
                        <Button
                          key={category.name}
                          onClick={() => setActiveCategory(category.name)}
                          size="sm"
                          variant={activeCategory === category.name ? "default" : "outline"}
                          className={activeCategory === category.name 
                            ? "bg-indigo-600 hover:bg-indigo-700"
                            : ""
                          }
                        >
                          {category.name} ({category.count})
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* FAQs list */}
                {Object.keys(faqsByCategory).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
                      <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 font-medium text-lg flex justify-between items-center">
                          {category}
                          <Badge variant="outline" className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {categoryFaqs.length}
                          </Badge>
                        </div>
                        
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {categoryFaqs.map((faq) => (
                            <div key={faq.id} className="border-t border-gray-200 dark:border-gray-700">
                              <button
                                onClick={() => toggleFaq(faq.id)}
                                className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                              >
                                <span className="font-medium">{faq.question}</span>
                                {expandedFaqs[faq.id] ? (
                                  <ChevronUp size={18} className="text-gray-400" />
                                ) : (
                                  <ChevronDown size={18} className="text-gray-400" />
                                )}
                              </button>
                              
                              {expandedFaqs[faq.id] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="px-4 pb-4 pt-0"
                                >
                                  <div className="pl-4 border-l-2 border-indigo-300 dark:border-indigo-700 text-gray-600 dark:text-gray-300">
                                    {faq.answer}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500 flex flex-col items-center">
                    <Search size={40} className="mb-2 opacity-40" />
                    <p>No FAQs match your search criteria</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters} 
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Stats footer */}
        {pageCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            Analysis based on <strong>{pageCount}</strong> crawled pages {selectedFilesCount > 0 && `and ${selectedFilesCount} uploaded documents`}
          </motion.div>
        )}
      </div>
    );
  }
  
  // Show empty state if idle or no results
  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center p-6">
          <HelpCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Enter a website URL or upload documents to analyze and generate AI insights.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
