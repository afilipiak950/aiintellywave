
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { personaValidationConstraints } from "@/utils/form-validation";
import { AlertCircle } from 'lucide-react';

interface PromptFieldProps {
  generatedPrompt: string;
  onPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
}

export function PromptField({ generatedPrompt, onPromptChange, error }: PromptFieldProps) {
  const form = useFormContext();
  const { isDirty, isTouched } = form.getFieldState('prompt', form.formState);
  
  // Only show errors if the field has been touched/dirty or the form was submitted
  const isFormSubmitted = form.formState.isSubmitted;
  const showError = !!error && (isDirty || isTouched || isFormSubmitted);
  
  const maxLength = personaValidationConstraints.prompt.max;
  const charactersRemaining = maxLength - (generatedPrompt?.length || 0);
  const isApproachingLimit = charactersRemaining < 100;
  
  return (
    <FormItem className={showError ? "has-error" : ""}>
      <FormLabel className="text-base font-medium">AI Prompt</FormLabel>
      <div className="space-y-2">
        <div className="relative">
          <Textarea
            value={generatedPrompt}
            onChange={onPromptChange}
            className={`min-h-[150px] resize-none ${showError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            placeholder="Generated prompt will appear here. You can edit it to customize further."
            maxLength={maxLength}
          />
          {showError && (
            <div className="absolute right-2 top-2 text-destructive">
              <AlertCircle size={16} />
            </div>
          )}
        </div>
        <div className="flex justify-between">
          <div>{showError && <FormMessage>{error}</FormMessage>}</div>
          <span className={`text-xs ${isApproachingLimit ? 'text-amber-600' : 'text-muted-foreground'} ${charactersRemaining <= 0 ? 'text-destructive' : ''}`}>
            {charactersRemaining} characters remaining
          </span>
        </div>
      </div>
    </FormItem>
  );
}
