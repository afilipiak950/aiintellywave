
import React, { useState, useEffect } from 'react';
import { AnimatedCircuitBackground } from '../../components/train-ai/AnimatedCircuitBackground';
import { TrainAIHeader } from '../../components/train-ai/TrainAIHeader';
import { UrlInputForm } from '../../components/train-ai/UrlInputForm';
import { LoadingAnimation } from '../../components/train-ai/LoadingAnimation';
import { AISummary } from '../../components/train-ai/AISummary';
import { FAQAccordion, FAQ } from '../../components/train-ai/FAQAccordion';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock categories for FAQs
const FAQ_CATEGORIES = [
  'Company Information',
  'Products',
  'Services',
  'Pricing',
  'Technical Support',
  'General'
];

// Mock API call to crawl and analyze a website
const crawlWebsite = async (url: string): Promise<{
  summary: string;
  faqs: FAQ[];
}> => {
  // Simulate API call with delay
  return new Promise((resolve) => {
    // This would normally be an actual API call
    setTimeout(() => {
      // Mock data - in a real app, this would come from the API
      resolve({
        summary: `This website is for a company called ${new URL(url).hostname.split('.')[0].toUpperCase()}, which appears to be focused on providing digital solutions across various industries.\n\nTheir main offerings include software development, cloud services, and AI integration solutions. The company emphasizes their innovative approach and customer-centric values throughout their website.\n\nKey highlights include their project portfolio showcasing successful implementations across healthcare, finance, and retail sectors. They have a dedicated team of experts with backgrounds in various technical fields.\n\nThe website also mentions several partnerships with major technology providers and includes customer testimonials praising their reliability and technical expertise.\n\nThey appear to offer consultation services and have a blog section with insights on industry trends and technological advancements. Their contact information indicates they have offices in multiple locations.`,
        faqs: Array.from({ length: 100 }, (_, i) => ({
          id: `faq-${i + 1}`,
          question: `Question ${i + 1}: What is ${i % 5 === 0 ? 'the purpose of' : 'the benefit of using'} ${new URL(url).hostname.split('.')[0]}'s ${i % 3 === 0 ? 'services' : 'products'}?`,
          answer: `This is the answer to question ${i + 1}, explaining details about ${new URL(url).hostname.split('.')[0]}'s offerings. ${i % 7 === 0 ? 'It includes specific information about pricing and availability.' : 'It covers technical specifications and implementation details.'}`,
          category: FAQ_CATEGORIES[i % FAQ_CATEGORIES.length]
        }))
      });
    }, 5000); // 5 second delay to simulate processing
  });
};

const TrainAIPage: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Effect to simulate progress updates while loading
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      // Start at 0 progress
      setProgress(0);
      
      // Update progress every 100ms
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 0.5;
          
          // Update loading stage based on progress
          if (newProgress < 30) {
            setStage('Crawling Website');
          } else if (newProgress < 60) {
            setStage('Analyzing Content');
          } else if (newProgress < 90) {
            setStage('Generating AI Insights');
          } else {
            setStage('Finalizing Results');
          }
          
          return newProgress > 99 ? 99 : newProgress;
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const handleSubmit = async (websiteUrl: string) => {
    try {
      setUrl(websiteUrl);
      setIsLoading(true);
      setError(null);
      setSummary('');
      setFAQs([]);
      
      // Simulate crawling and analyzing the website
      const result = await crawlWebsite(websiteUrl);
      
      // Complete progress and load data
      setProgress(100);
      setSummary(result.summary);
      setFAQs(result.faqs);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${new URL(websiteUrl).hostname}`,
      });
    } catch (err) {
      setError('Failed to analyze the website. Please try again.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze the website",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 relative">
      {/* Animated background */}
      <AnimatedCircuitBackground />
      
      {/* Content */}
      <div className="relative z-10">
        <TrainAIHeader />
        
        <UrlInputForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
        
        <AnimatePresence>
          {/* Loading animation */}
          {isLoading && (
            <LoadingAnimation 
              progress={progress}
              stage={stage} 
            />
          )}
          
          {/* Error message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg mb-8"
            >
              <AlertCircle size={20} />
              <p>{error}</p>
            </motion.div>
          )}
          
          {/* Results: Summary and FAQs */}
          {!isLoading && summary && faqs.length > 0 && (
            <>
              <AISummary summary={summary} url={url} />
              <FAQAccordion faqs={faqs} />
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrainAIPage;
