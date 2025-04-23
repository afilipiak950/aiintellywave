import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from 'lucide-react';
import { UsageInstructions } from '@/components/mira-ai/UsageInstructions';
import { TypeSelector } from './TypeSelector';
import { InputSourceTabs } from './InputSourceTabs';
import { PreviewDisplay } from './PreviewDisplay';
import { useAuth } from '@/context/auth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { SearchStringSource, SearchStringType } from '@/hooks/search-strings/search-string-types';
import { useSearchStringSubmission } from '@/hooks/search-strings/creator/use-search-string-submission';
import { useToast } from '@/hooks/use-toast';

interface SearchStringCreatorProps {
  onError?: (error: string | null) => void;
  onSuccess?: () => void;
}

const SearchStringCreator: React.FC<SearchStringCreatorProps> = ({ onError, onSuccess }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { toast } = useToast();

  // State für Formular
  const [type, setType] = useState<SearchStringType>('recruiting');
  const [inputSource, setInputSource] = useState<SearchStringSource>('text');
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewString, setPreviewString] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Verwende vereinfachten Submission Hook
  const { 
    handleSubmitText, 
    handleSubmitWebsite, 
    handleSubmitPDF, 
    isSubmitting, 
    setIsSubmitting 
  } = useSearchStringSubmission({
    onSuccess: () => {
      // Formular zurücksetzen
      setInputText('');
      setInputUrl('');
      setSelectedFile(null);
      setPreviewString('');
      setIsSubmitting(false);
      
      // Callback aufrufen
      if (onSuccess) onSuccess();
      
      // Erfolgsmeldung
      toast({
        title: "Erfolgreich",
        description: "Ihre Suchanfrage wurde erstellt und wird verarbeitet.",
      });
    },
    onError: (err) => {
      setIsSubmitting(false);
      if (onError) onError(err);
    }
  });

  const handleTypeChange = (value: SearchStringType) => {
    setType(value);
    setPreviewString(''); // Reset preview on type change
  };

  const handleSourceChange = (value: SearchStringSource) => {
    setInputSource(value);
    setPreviewString(''); // Reset preview on source change
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setPreviewString('');
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
    setPreviewString('');
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setPreviewString('');
  };

  // Vereinfachter Submit-Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein, um diese Funktion zu nutzen.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (inputSource === 'text' && inputText.trim()) {
        handleSubmitText(inputText, type);
      } else if (inputSource === 'website' && inputUrl.trim()) {
        handleSubmitWebsite(inputUrl, type);
      } else if (inputSource === 'pdf' && selectedFile) {
        handleSubmitPDF(selectedFile, type);
      } else {
        setIsSubmitting(false);
        toast({
          title: "Fehler",
          description: "Bitte geben Sie gültige Eingabedaten für den ausgewählten Quelltyp an.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setIsSubmitting(false);
      console.error("Error in submit handler:", error);
      toast({
        title: "Fehler",
        description: error.message || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Create Search String</CardTitle>
          <CardDescription>Generate a search string for recruiting or lead generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAuthenticated && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                You must be logged in to create search strings.
              </AlertDescription>
            </Alert>
          )}
          
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

            <Button type="submit" disabled={isSubmitting || !isAuthenticated} className="w-full">
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
