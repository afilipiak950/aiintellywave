
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, HelpCircle, Search, FilterX, Edit2, Check, X, Save } from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FAQ } from '../FAQAccordion';

interface EditableFAQAccordionProps {
  faqs: FAQ[];
  jobId: string;
  onFaqUpdated?: (updatedFaq: FAQ) => void;
}

export const EditableFAQAccordion: React.FC<EditableFAQAccordionProps> = ({ faqs, jobId, onFaqUpdated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [displayedFaqs, setDisplayedFaqs] = useState<FAQ[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [editingFaq, setEditingFaq] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ question: string; answer: string }>({ 
    question: '', 
    answer: '' 
  });
  const [isSaving, setIsSaving] = useState(false);
  
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

  // Start editing FAQ
  const startEditing = (faq: FAQ) => {
    setEditingFaq(faq.id);
    setEditValues({
      question: faq.question,
      answer: faq.answer
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingFaq(null);
    setEditValues({ question: '', answer: '' });
  };

  // Save edited FAQ
  const saveFaqChanges = async (faq: FAQ) => {
    if (!editValues.question.trim() || !editValues.answer.trim()) {
      toast({
        title: "Validation Error",
        description: "Question and answer fields cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.rpc('update_faq_item', {
        p_job_id: jobId,
        p_faq_id: faq.id,
        p_question: editValues.question,
        p_answer: editValues.answer,
        p_category: faq.category
      });

      if (error) {
        throw error;
      }

      // Update local state
      const updatedFaq = {
        ...faq,
        question: editValues.question,
        answer: editValues.answer
      };

      // Notify parent component
      if (onFaqUpdated) {
        onFaqUpdated(updatedFaq);
      }

      toast({
        title: "FAQ Updated",
        description: "Your changes have been saved successfully.",
        variant: "default"
      });

      setEditingFaq(null);
    } catch (error: any) {
      console.error("Error updating FAQ:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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
        {faqs.length === 100 && (
          <span className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded text-sm">
            All 100 FAQs generated
          </span>
        )}
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
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {categoryFaqs.map((faq) => (
                    <div key={faq.id} className="border-t border-gray-200 dark:border-gray-700">
                      {editingFaq === faq.id ? (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Question
                            </label>
                            <Input
                              value={editValues.question}
                              onChange={(e) => setEditValues(prev => ({ ...prev, question: e.target.value }))}
                              className="w-full"
                              placeholder="Enter question"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Answer
                            </label>
                            <Textarea
                              value={editValues.answer}
                              onChange={(e) => setEditValues(prev => ({ ...prev, answer: e.target.value }))}
                              className="w-full min-h-[100px]"
                              placeholder="Enter answer"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditing}
                              disabled={isSaving}
                            >
                              <X size={16} className="mr-1" /> Cancel
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => saveFaqChanges(faq)}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <span className="animate-spin mr-1">⟳</span> Saving...
                                </>
                              ) : (
                                <>
                                  <Save size={16} className="mr-1" /> Save
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-base mb-2">{faq.question}</h4>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="p-1 h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(faq);
                              }}
                            >
                              <Edit2 size={16} />
                            </Button>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 pl-2 border-l-2 border-primary/30">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
    </motion.div>
  );
};
