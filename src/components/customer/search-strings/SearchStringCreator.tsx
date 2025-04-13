
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { useSearchStrings, SearchStringType, SearchStringSource } from '@/hooks/search-strings/use-search-strings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileInput } from '@/components/ui/file-input';
import { useToast } from '@/hooks/use-toast';
import { UsageInstructions } from '@/components/mira-ai/UsageInstructions';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);

  const generateSourcePreview = useCallback(async () => {
    if (inputSource === 'text' && inputText) {
      try {
        setIsPreviewLoading(true);
        const preview = await generatePreview(type, inputSource, inputText);
        setPreviewString(preview);
      } catch (error) {
        console.error('Error generating preview:', error);
        toast({
          title: "Error",
          description: "Failed to generate preview",
          variant: "destructive"
        });
      } finally {
        setIsPreviewLoading(false);
      }
    } else if (inputSource === 'website' && inputUrl) {
      try {
        setIsPreviewLoading(true);
        const preview = await generatePreview(type, inputSource, undefined, inputUrl);
        setPreviewString(preview);
      } catch (error) {
        console.error('Error generating preview:', error);
        toast({
          title: "Error",
          description: "Failed to generate preview",
          variant: "destructive"
        });
      } finally {
        setIsPreviewLoading(false);
      }
    } else if (inputSource === 'pdf' && selectedFile) {
      try {
        setIsPreviewLoading(true);
        const preview = await generatePreview(type, inputSource, undefined, undefined, selectedFile);
        setPreviewString(preview);
      } catch (error) {
        console.error('Error generating preview:', error);
        toast({
          title: "Error",
          description: "Failed to generate preview",
          variant: "destructive"
        });
      } finally {
        setIsPreviewLoading(false);
      }
    } else {
      setPreviewString(null);
    }
  }, [type, inputSource, inputText, inputUrl, selectedFile, generatePreview, setPreviewString, toast]);

  // Generate preview when input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      generateSourcePreview();
    }, 500); // Add a small delay to avoid too many requests

    return () => clearTimeout(timer);
  }, [type, inputSource, inputText, inputUrl, selectedFile, generateSourcePreview]);

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
          description: "Search string has been created and is being processed. The website will be fully crawled and analyzed."
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
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recruiting">Recruiting</SelectItem>
                  <SelectItem value="lead_generation">Lead Generation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={inputSource} onValueChange={handleSourceChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="website">Website</TabsTrigger>
                <TabsTrigger value="pdf">PDF</TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="inputText">Input Text</Label>
                  <Textarea
                    id="inputText"
                    placeholder="Enter text to generate a search string"
                    value={inputText}
                    onChange={handleTextChange}
                    className="min-h-[150px]"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="website" className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="inputUrl">Website URL</Label>
                  <Input
                    id="inputUrl"
                    type="url"
                    placeholder="Enter a website URL (job posting or company page)"
                    value={inputUrl}
                    onChange={handleUrlChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Our crawler will analyze the entire webpage and extract all relevant information for your search string.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="pdf" className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="pdfFile">Upload PDF</Label>
                  <FileInput onFileSelect={handleFileSelect} />
                </div>
              </TabsContent>
            </Tabs>

            {isPreviewLoading ? (
              <div className="border rounded-md p-4 bg-gray-50 flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">Preparing preview...</span>
              </div>
            ) : previewString && (
              <div className="border rounded-md p-4 bg-gray-50">
                <Label>Preview</Label>
                <div className="whitespace-pre-line font-mono text-sm">{previewString}</div>
                {inputSource === 'website' && (
                  <div className="mt-2 bg-yellow-50 p-2 rounded-md text-xs">
                    ⚠️ This is just a preview. When you submit, the full website will be crawled, analyzed, and processed into a complete search string with all extracted details.
                  </div>
                )}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting}>
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
