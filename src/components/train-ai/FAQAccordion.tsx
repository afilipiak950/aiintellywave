
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Search, FilterX } from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [displayedFaqs, setDisplayedFaqs] = useState<FAQ[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // Get unique categories and count FAQs in each
  const categories = React.useMemo(() => {
    const categoryMap = faqs.reduce((acc, faq) => {
      const category = faq.category || 'General';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryMap).map(([name, count]) => ({ name, count }));
  }, [faqs]);
  
  // Filter FAQs based on search and category
  useEffect(() => {
    const filtered = faqs.filter(faq => {
      const matchesSearch = searchTerm === '' || 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !activeCategory || 
        (faq.category || 'General') === activeCategory;
        
      return matchesSearch && matchesCategory;
    });
    
    setDisplayedFaqs(filtered);
  }, [faqs, searchTerm, activeCategory]);
  
  // Group FAQs by category for display
  const faqsByCategory = React.useMemo(() => {
    return displayedFaqs.reduce((acc, faq) => {
      const category = faq.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(faq);
      return acc;
    }, {} as Record<string, FAQ[]>);
  }, [displayedFaqs]);
  
  const handleCategoryClick = (category: string | null) => {
    setActiveCategory(category);
    
    // Auto-expand the newly selected category if not already expanded
    if (category && !expandedCategories[category]) {
      setExpandedCategories(prev => ({...prev, [category]: true}));
    }
  };
  
  // Toggle category expansion
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => ({...prev, [category]: !prev[category]}));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setActiveCategory(null);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8"
    >
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
        <span className="ml-2 bg-primary/10 text-primary px-2 py-1 rounded text-sm">
          {displayedFaqs.length} of {faqs.length} Questions
        </span>
      </div>
      
      {/* Search and filter */}
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
              <FilterX size={16} />
              <span className="ml-1">Clear</span>
            </Button>
          )}
        </div>
        
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                activeCategory === null
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All ({faqs.length})
            </button>
            {categories.map(category => (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  activeCategory === category.name
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* FAQ Accordion */}
      <AnimatePresence>
        {Object.entries(faqsByCategory).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
              <motion.div 
                key={category}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <div 
                  className={`px-4 py-3 flex justify-between items-center cursor-pointer ${
                    expandedCategories[category] 
                      ? 'bg-gray-50 dark:bg-gray-700/50' 
                      : 'bg-white dark:bg-gray-800'
                  }`}
                  onClick={() => toggleCategoryExpansion(category)}
                >
                  <h3 className="font-medium text-lg flex items-center">
                    {category}
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 rounded-full">
                      {categoryFaqs.length}
                    </span>
                  </h3>
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      expandedCategories[category] ? 'transform rotate-180' : ''
                    }`} 
                  />
                </div>
                
                {expandedCategories[category] && (
                  <Accordion type="single" collapsible className="w-full">
                    {categoryFaqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id} className="border-t border-gray-200 dark:border-gray-700">
                        <AccordionTrigger className="hover:text-primary px-4">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                          <div className="pl-2 border-l-2 border-primary/30">
                            {faq.answer}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-gray-500 flex flex-col items-center">
            <FilterX size={40} className="mb-2 opacity-40" />
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
      </AnimatePresence>
    </motion.div>
  );
};
