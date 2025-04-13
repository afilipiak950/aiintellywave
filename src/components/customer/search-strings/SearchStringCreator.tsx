
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { UsageInstructions } from '@/components/mira-ai/UsageInstructions';
import { TypeSelector } from './TypeSelector';
import { InputSourceTabs } from './InputSourceTabs';
import { PreviewDisplay } from './PreviewDisplay';
import { useSearchStringCreator } from '@/hooks/search-strings/use-search-string-creator';

interface SearchStringCreatorProps {
  onError?: (error: string | null) => void;
}

const SearchStringCreator: React.FC<SearchStringCreatorProps> = ({ onError }) => {
  const {
    type,
    inputSource,
    inputText,
    inputUrl,
    isSubmitting,
    isPreviewLoading,
    previewString,
    handleTypeChange,
    handleSourceChange,
    handleTextChange,
    handleUrlChange,
    handleFileSelect,
    handleSubmit,
    isAuthenticated
  } = useSearchStringCreator({ onError });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Create Search String</CardTitle>
          <CardDescription>Generate a search string for recruiting or lead generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <TypeSelector 
              type={type} 
              onTypeChange={handleTypeChange} 
            />

            <InputSourceTabs
              inputSource={inputSource}
              onSourceChange={handleSourceChange}
              inputText={inputText}
              onTextChange={handleTextChange}
              inputUrl={inputUrl}
              onUrlChange={handleUrlChange}
              onFileSelect={handleFileSelect}
            />

            <PreviewDisplay 
              isLoading={isPreviewLoading} 
              previewString={previewString} 
              inputSource={inputSource} 
            />

            <Button type="submit" disabled={isSubmitting || !isAuthenticated}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {inputSource === 'website' ? 'Crawling Website...' : 'Processing...'}
                </>
              ) : (
                'Generate Search String'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <UsageInstructions />
    </>
  );
};

export default SearchStringCreator;
