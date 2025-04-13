
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchStringType, SearchStringSource, useSearchStrings } from '@/hooks/search-strings/use-search-strings';
import { useAuth } from '@/context/auth';
import { LuRotateCw, LuFileUp, LuGlobe, LuAlignLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchStringCreatorProps {
  companyId: string;
}

const SearchStringCreator: React.FC<SearchStringCreatorProps> = ({ companyId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createSearchString, isLoading, selectedFile, setSelectedFile } = useSearchStrings({ companyId });
  
  const [stringType, setStringType] = useState<SearchStringType>('recruiting');
  const [inputTab, setInputTab] = useState<SearchStringSource>('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to create search strings',
        variant: 'destructive',
      });
      return;
    }

    if (inputTab === 'text' && !textInput.trim()) {
      toast({
        title: 'Input required',
        description: 'Please enter text to generate a search string',
        variant: 'destructive',
      });
      return;
    }

    if (inputTab === 'website' && !urlInput.trim()) {
      toast({
        title: 'URL required',
        description: 'Please enter a website URL to generate a search string',
        variant: 'destructive',
      });
      return;
    }

    if (inputTab === 'pdf' && !selectedFile) {
      toast({
        title: 'File required',
        description: 'Please upload a PDF file to generate a search string',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await createSearchString(
        stringType,
        inputTab,
        inputTab === 'text' ? textInput : undefined,
        inputTab === 'website' ? urlInput : undefined,
        inputTab === 'pdf' ? selectedFile : undefined
      );

      // Reset form
      setTextInput('');
      setUrlInput('');
      setSelectedFile(null);

      toast({
        title: 'Search string created',
        description: 'Your search string is being generated. This may take a moment.',
      });
      
    } catch (error) {
      // Error is handled by the hook
      console.error('Error creating search string:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeInstructions = () => {
    if (stringType === 'recruiting') {
      return 'Please provide information about the candidates you are looking for. Include details like job title, location, experience level, key skills, education, and any other relevant qualifications.';
    }
    return 'Please provide information about your target audience for lead generation. Include details like industry, company size, job titles, location, and any other characteristics of your ideal prospects.';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create a New Search String</CardTitle>
        <CardDescription>
          Generate optimized search strings for recruiting or lead generation campaigns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Search String Type</label>
          <Select 
            value={stringType} 
            onValueChange={(value) => setStringType(value as SearchStringType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recruiting">Recruiting Campaign</SelectItem>
              <SelectItem value="lead_generation">Lead Generation Campaign</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={inputTab} onValueChange={(value) => setInputTab(value as SearchStringSource)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <LuAlignLeft className="h-4 w-4" />
              <span>Text Input</span>
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center gap-2">
              <LuGlobe className="h-4 w-4" />
              <span>Website</span>
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <LuFileUp className="h-4 w-4" />
              <span>PDF Upload</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">{getTypeInstructions()}</p>
            <Textarea 
              placeholder="Enter your detailed description here..." 
              className="min-h-[200px]"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
          </TabsContent>
          
          <TabsContent value="website" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Enter a website URL that contains relevant information. We'll analyze the content and generate a search string.
            </p>
            <Input 
              placeholder="https://example.com/job-description" 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </TabsContent>
          
          <TabsContent value="pdf" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Upload a PDF document that contains relevant information. We'll extract the content and generate a search string.
            </p>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LuRotateCw className="mr-2 h-4 w-4 animate-spin" />
              Generating Search String...
            </>
          ) : (
            'Generate Search String'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SearchStringCreator;
