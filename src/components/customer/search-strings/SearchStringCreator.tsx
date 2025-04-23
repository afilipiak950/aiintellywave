
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { SearchStringType, SearchStringSource } from '@/hooks/search-strings/search-string-types';
import { useSearchStringCore } from '@/hooks/search-strings/use-search-string-core';
import { useSearchStringOperations } from '@/hooks/search-strings/use-search-string-operations';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea";
import { Input } from '@/components/ui/input';
import { FileInput } from '@/components/ui/file-input';

interface SearchStringCreatorProps {
  onError?: (error: string | null) => void;
}

const SearchStringCreator: React.FC<SearchStringCreatorProps> = ({ onError }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  // Core hooks
  const { fetchSearchStrings } = useSearchStringCore();
  const { createSearchString, isSubmitting } = useSearchStringOperations({ 
    user, 
    fetchSearchStrings 
  });

  // Form state
  const [type, setType] = useState<SearchStringType>('recruiting');
  const [inputSource, setInputSource] = useState<SearchStringSource>('text');
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      if (inputSource === 'text' && inputText.trim()) {
        createSearchString(type, inputSource, inputText);
        setInputText('');
      } else if (inputSource === 'website' && inputUrl.trim()) {
        createSearchString(type, inputSource, undefined, inputUrl);
        setInputUrl('');
      } else if (inputSource === 'pdf' && selectedFile) {
        createSearchString(type, inputSource, undefined, undefined, selectedFile);
        setSelectedFile(null);
      } else {
        if (onError) onError("Bitte geben Sie gültige Eingabedaten an.");
      }
    } catch (error: any) {
      if (onError) onError(error.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Neuen Search String erstellen</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector */}
        <div className="space-y-2">
          <Label>Search String Typ</Label>
          <div className="flex space-x-2">
            <Button 
              type="button"
              variant={type === 'recruiting' ? 'default' : 'outline'}
              onClick={() => setType('recruiting')}
            >
              Recruiting
            </Button>
            <Button 
              type="button"
              variant={type === 'lead_generation' ? 'default' : 'outline'}
              onClick={() => setType('lead_generation')}
            >
              Lead Generation
            </Button>
          </div>
        </div>

        {/* Input Source Tabs */}
        <Tabs value={inputSource} onValueChange={(value) => setInputSource(value as SearchStringSource)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="website">Website</TabsTrigger>
            <TabsTrigger value="pdf">PDF</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="pt-4">
            <div className="space-y-2">
              <Label htmlFor="inputText">Texteingabe</Label>
              <Textarea
                id="inputText"
                placeholder="Geben Sie Text ein, um einen Search String zu generieren"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
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
                placeholder="Geben Sie eine Website-URL ein (z.B. Stellenangebot oder Firmenseite)"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="pdf" className="pt-4">
            <div className="space-y-2">
              <Label htmlFor="pdfFile">PDF hochladen</Label>
              <FileInput onFileSelect={setSelectedFile} />
            </div>
          </TabsContent>
        </Tabs>

        <Button 
          type="submit" 
          disabled={isSubmitting || !isAuthenticated} 
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird verarbeitet...
            </>
          ) : (
            'Search String generieren'
          )}
        </Button>
      </form>
    </div>
  );
};

export default SearchStringCreator;
