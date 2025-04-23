
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea";
import { Input } from '@/components/ui/input';
import { FileInput } from '@/components/ui/file-input';
import { SearchStringSource } from '@/hooks/search-strings/search-string-types';

interface InputSourceTabsProps {
  inputSource: SearchStringSource;
  onSourceChange: (value: SearchStringSource) => void;
  inputText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  inputUrl: string;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileSelect: (file: File | null) => void;
}

export const InputSourceTabs: React.FC<InputSourceTabsProps> = ({ 
  inputSource,
  onSourceChange,
  inputText,
  onTextChange,
  inputUrl,
  onUrlChange,
  onFileSelect
}) => {
  return (
    <Tabs value={inputSource} onValueChange={(value) => onSourceChange(value as SearchStringSource)} className="w-full">
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
            onChange={onTextChange}
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
            onChange={onUrlChange}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Our crawler will analyze the entire webpage and extract all relevant information for your search string.
          </p>
        </div>
      </TabsContent>
      
      <TabsContent value="pdf" className="pt-4">
        <div className="space-y-2">
          <Label htmlFor="pdfFile">Upload PDF</Label>
          <FileInput onFileSelect={onFileSelect} />
        </div>
      </TabsContent>
    </Tabs>
  );
};
