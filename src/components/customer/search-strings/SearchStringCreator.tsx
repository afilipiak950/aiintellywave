import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { useSearchStrings, SearchStringType, SearchStringSource } from '@/hooks/search-strings/use-search-strings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileInput } from '@/components/ui/file-input';
import { useToast } from '@/hooks/use-toast';
import { UsageInstructions } from '@/components/mira-ai/UsageInstructions';

// Add onError prop to the component's interface
interface SearchStringCreatorProps {
  companyId: string;
  onError?: (error: string | null) => void;
}

const SearchStringCreator: React.FC<SearchStringCreatorProps> = ({ companyId, onError }) => {
  const { createSearchString, generatePreview, previewString, setPreviewString, selectedFile, setSelectedFile } = useSearchStrings({ companyId });
  const { toast } = useToast();
  const [type, setType] = useState<SearchStringType>('recruiting');
  const [inputSource, setInputSource] = useState<SearchStringSource>('text');
  const [inputText, setInputText] = useState<string>('');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const generateInitialPreview = async () => {
      if (inputSource === 'text' && inputText) {
        try {
          const preview = await generatePreview(type, inputSource, inputText);
          setPreviewString(preview);
        } catch (error) {
          console.error('Error generating preview:', error);
          toast({
            title: "Error",
            description: "Failed to generate preview",
            variant: "destructive"
          });
        }
      } else if (inputSource === 'website' && inputUrl) {
        try {
          const preview = await generatePreview(type, inputSource, undefined, inputUrl);
          setPreviewString(preview);
        } catch (error) {
          console.error('Error generating preview:', error);
          toast({
            title: "Error",
            description: "Failed to generate preview",
            variant: "destructive"
          });
        }
      } else if (inputSource === 'pdf' && selectedFile) {
        try {
          const preview = await generatePreview(type, inputSource, undefined, undefined, selectedFile);
          setPreviewString(preview);
        } catch (error) {
          console.error('Error generating preview:', error);
          toast({
            title: "Error",
            description: "Failed to generate preview",
            variant: "destructive"
          });
        }
      } else {
        setPreviewString(null);
      }
    };

    generateInitialPreview();
  }, [type, inputSource, inputText, inputUrl, selectedFile, generatePreview, setPreviewString, toast]);

  const handleTypeChange = (value: SearchStringType) => {
    setType(value);
    setPreviewString(null);
  };

  const handleSourceChange = (value: SearchStringSource) => {
    setInputSource(value);
    setPreviewString(null);
    setInputText('');
    setInputUrl('');
    setSelectedFile(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyId) {
      toast({
        title: "Error",
        description: "Missing company information",
        variant: "destructive"
      });
      if (onError) onError("Missing company information");
      return;
    }
    
    if (inputSource === 'text' && !inputText) {
      toast({
        title: "Input Required",
        description: "Please enter text to generate a search string",
        variant: "destructive"
      });
      if (onError) onError("Please enter text to generate a search string");
      return;
    }
    
    if (inputSource === 'website' && !inputUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to generate a search string",
        variant: "destructive"
      });
      if (onError) onError("Please enter a URL to generate a search string");
      return;
    }
    
    if (inputSource === 'pdf' && !selectedFile) {
      toast({
        title: "File Required",
        description: "Please upload a PDF file to generate a search string",
        variant: "destructive"
      });
      if (onError) onError("Please upload a PDF file to generate a search string");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Clear any previous errors
      if (onError) onError(null);
      
      const result = await createSearchString(
        type, 
        inputSource, 
        inputSource === 'text' ? inputText : undefined,
        inputSource === 'website' ? inputUrl : undefined,
        inputSource === 'pdf' ? selectedFile : null
      );
      
      if (result) {
        // Reset form on success
        setInputText('');
        setInputUrl('');
        setSelectedFile(null);
        setPreviewString(null);
        
        toast({
          title: "Success",
          description: "Search string has been created and is being processed."
        });
      }
    } catch (error) {
      console.error('Error creating search string:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      if (errorMessage.includes('row-level security')) {
        if (onError) onError("Permission denied: You don't have access to create search strings. Please check with your administrator.");
        toast({
          title: "Permission Error",
          description: "You don't have access to create search strings. Please check with your administrator.",
          variant: "destructive"
        });
      } else {
        if (onError) onError(`Failed to create search string: ${errorMessage}`);
        toast({
          title: "Error",
          description: `Failed to create search string: ${errorMessage}`,
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <RadioGroup defaultValue={type} onValueChange={handleTypeChange} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recruiting" id="recruiting" />
                  <Label htmlFor="recruiting">Recruiting</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lead_generation" id="lead_generation" />
                  <Label htmlFor="lead_generation">Lead Generation</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="inputSource">Input Source</Label>
              <RadioGroup defaultValue={inputSource} onValueChange={handleSourceChange} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text">Text</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="website" id="website" />
                  <Label htmlFor="website">Website</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf">PDF</Label>
                </div>
              </RadioGroup>
            </div>

            {inputSource === 'text' && (
              <div>
                <Label htmlFor="inputText">Input Text</Label>
                <Textarea
                  id="inputText"
                  placeholder="Enter text to generate a search string"
                  value={inputText}
                  onChange={handleTextChange}
                />
              </div>
            )}

            {inputSource === 'website' && (
              <div>
                <Label htmlFor="inputUrl">Website URL</Label>
                <Input
                  id="inputUrl"
                  type="url"
                  placeholder="Enter a website URL"
                  value={inputUrl}
                  onChange={handleUrlChange}
                />
              </div>
            )}

            {inputSource === 'pdf' && (
              <div>
                <Label htmlFor="pdfFile">Upload PDF</Label>
                <FileInput onFileSelect={handleFileSelect} />
              </div>
            )}

            {previewString && (
              <div className="border rounded-md p-4 bg-gray-50">
                <Label>Preview</Label>
                <div className="whitespace-pre-line font-mono text-sm">{previewString}</div>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Generate Search String'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <UsageInstructions />
    </>
  );
};

export default SearchStringCreator;
