
import React from 'react';
import { FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface PromptFieldProps {
  generatedPrompt: string;
  onPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function PromptField({ generatedPrompt, onPromptChange }: PromptFieldProps) {
  return (
    <FormItem>
      <FormLabel className="text-base font-medium">AI Prompt</FormLabel>
      <Textarea
        value={generatedPrompt}
        onChange={onPromptChange}
        className="min-h-[150px] resize-none"
        placeholder="Generated prompt will appear here. You can edit it to customize further."
        readOnly={!generatedPrompt}
      />
    </FormItem>
  );
}
