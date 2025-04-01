
import React from 'react';
import { AnimatedCircuitBackground } from '../../components/train-ai/AnimatedCircuitBackground';
import { TrainAIHeader } from '../../components/train-ai/TrainAIHeader';
import { UrlInputForm } from '../../components/train-ai/UrlInputForm';
import { LoadingAnimation } from '../../components/train-ai/LoadingAnimation';
import { DocumentUpload } from '../../components/train-ai/DocumentUpload';
import { AnimatePresence, motion } from 'framer-motion';
import { useAITraining } from '@/hooks/use-ai-training';
import { ErrorMessage } from '@/components/train-ai/ErrorMessage';
import { TrainAIResults } from '@/components/train-ai/TrainAIResults';

const TrainAIPage: React.FC = () => {
  const {
    url,
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
    handleRetrain
  } = useAITraining();

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 relative">
      <AnimatedCircuitBackground />
      
      <div className="relative z-10">
        <TrainAIHeader />
        
        <UrlInputForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading || isUploading} 
        />
        
        <DocumentUpload
          onFilesSelected={handleFilesSelected}
          isProcessing={isLoading || isUploading}
        />
        
        <AnimatePresence mode="sync">
          {isLoading && (
            <motion.div
              key="loading-animation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingAnimation 
                progress={progress}
                stage={stage} 
              />
            </motion.div>
          )}
          
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
        </AnimatePresence>
        
        <TrainAIResults
          jobStatus={jobStatus}
          summary={summary}
          url={url}
          faqs={faqs}
          pageCount={pageCount}
          selectedFilesCount={selectedFiles.length}
          handleRetrain={handleRetrain}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default TrainAIPage;
