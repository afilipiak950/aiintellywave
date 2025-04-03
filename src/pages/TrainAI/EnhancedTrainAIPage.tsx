
import React from 'react';
import { motion } from 'framer-motion';
import { useAITraining } from '@/hooks/use-ai-training';
import { useAuth } from '@/context/auth';
import { EnhancedTrainAIHeader } from '@/components/train-ai/enhanced/EnhancedTrainAIHeader';
import { AdvancedUrlInputForm } from '@/components/train-ai/enhanced/AdvancedUrlInputForm';
import { EnhancedDocumentUpload } from '@/components/train-ai/enhanced/EnhancedDocumentUpload';
import { EnhancedLoadingAnimation } from '@/components/train-ai/enhanced/EnhancedLoadingAnimation';
import { EnhancedTrainAIResults } from '@/components/train-ai/enhanced/EnhancedTrainAIResults';
import { ErrorMessage } from '@/components/train-ai/ErrorMessage';
import { AnimatedParticlesBackground } from '@/components/train-ai/enhanced/AnimatedParticlesBackground';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EnhancedTrainAIPage: React.FC = () => {
  const {
    url,
    setUrl,
    isLoading,
    isUploading,
    progress,
    stage,
    summary,
    faqs,
    error,
    pageCount,
    selectedFiles,
    jobStatus,
    handleFilesSelected,
    handleSubmit,
    handleRetrain,
    handleCancelJob,
    clearFiles,
    userId
  } = useAITraining();

  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('input');

  // Show results tab when processing completes
  React.useEffect(() => {
    if (jobStatus === 'completed' && !isLoading) {
      setActiveTab('results');
    }
  }, [jobStatus, isLoading]);

  if (!user) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 dark:text-gray-300">Please log in to use the AI training feature.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 relative min-h-screen">
      <AnimatedParticlesBackground />
      
      <div className="relative z-10 space-y-6">
        <EnhancedTrainAIHeader />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="input" disabled={isLoading}>Input Sources</TabsTrigger>
            <TabsTrigger value="results" disabled={jobStatus === 'idle' && !isLoading}>
              Results
              {jobStatus === 'completed' && <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Ready</span>}
              {jobStatus === 'processing' && <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Processing</span>}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AdvancedUrlInputForm 
                onSubmit={handleSubmit} 
                isLoading={isLoading || isUploading}
                initialUrl={url}
                onUrlChange={setUrl}
              />
              
              <EnhancedDocumentUpload
                onFilesSelected={handleFilesSelected}
                isProcessing={isLoading || isUploading}
                selectedFiles={selectedFiles}
                onClearFiles={clearFiles}
              />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            {error && !isLoading && (
              <motion.div
                key="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ErrorMessage error={error} />
              </motion.div>
            )}
            
            <EnhancedTrainAIResults
              jobStatus={jobStatus}
              summary={summary}
              url={url}
              faqs={faqs}
              pageCount={pageCount}
              selectedFilesCount={selectedFiles.length}
              handleRetrain={handleRetrain}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
        
        {isLoading && (
          <motion.div
            key="loading-animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <EnhancedLoadingAnimation 
              progress={progress}
              stage={stage} 
              onCancel={handleCancelJob}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTrainAIPage;
