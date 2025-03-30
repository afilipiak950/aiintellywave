
import React from 'react';
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { personaValidationConstraints } from "@/utils/form-validation";

interface PromptFieldProps {
  generatedPrompt: string;
  onPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
}

export function PromptField({ generatedPrompt, onPromptChange, error }: PromptFieldProps) {
  const maxLength = personaValidationConstraints.prompt.max;
  const charactersRemaining = maxLength - (generatedPrompt?.length || 0);
  const isApproachingLimit = charactersRemaining < 100;

  return (
    <FormItem>
      <FormLabel className="text-base font-medium">AI Prompt</FormLabel>
      <div className="space-y-2">
        <Textarea
          value={generatedPrompt}
          onChange={onPromptChange}
          className="min-h-[150px] resize-none"
          placeholder="Generated prompt will appear here. You can edit it to customize further."
          readOnly={!generatedPrompt}
          maxLength={maxLength}
        />
        <div className="flex justify-end">
          <span className={`text-xs ${isApproachingLimit ? 'text-amber-600' : 'text-muted-foreground'}`}>
            {charactersRemaining} characters remaining
          </span>
        </div>
        {error && <FormMessage>{error}</FormMessage>}
      </div>
    </FormItem>
  );
}
