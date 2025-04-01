
import React from 'react';
import { AnimatedCircuitBackground } from '../../components/train-ai/AnimatedCircuitBackground';
import { TrainAIHeader } from '../../components/train-ai/TrainAIHeader';
import { UrlInputForm } from '../../components/train-ai/UrlInputForm';
import { LoadingAnimation } from '../../components/train-ai/LoadingAnimation';
import { DocumentUpload } from '../../components/train-ai/DocumentUpload';
import { AnimatePresence } from 'framer-motion';
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
        
        <AnimatePresence mode="wait">
          {isLoading && (
            <LoadingAnimation 
              progress={progress}
              stage={stage} 
            />
          )}
          
          {error && <ErrorMessage error={error} />}
          
          {!isLoading && summary && (
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrainAIPage;
