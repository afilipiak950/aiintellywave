
import React, { useEffect } from 'react';
import { Form } from "@/components/ui/form";
import { AIPersona } from '@/types/persona';
import { PersonaCreationFormValues } from '../schemas/persona-form-schema';
import { usePersonaForm } from '../hooks/usePersonaForm';
import { PersonaNameField } from './form-sections/PersonaNameField';
import { StyleSelectionField } from './form-sections/StyleSelectionField';
import { FunctionSelectionField } from './form-sections/FunctionSelectionField';
import { PromptField } from './form-sections/PromptField';
import { FormSubmitButton } from './form-sections/FormSubmitButton';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface PersonaCreationFormProps {
  suggestedPersona: Partial<AIPersona> | null;
  onSubmit: (values: PersonaCreationFormValues) => Promise<void>;
}

export function PersonaCreationForm({ suggestedPersona, onSubmit }: PersonaCreationFormProps) {
  const {
    form,
    isSubmitting,
    customStyle,
    customFunction,
    generatedPrompt,
    handleStyleChange,
    handleFunctionChange,
    handlePromptChange,
    handleSubmit,
    formError
  } = usePersonaForm({ suggestedPersona, onSubmit });

  // Ensure form is validated on first render and whenever values change
  useEffect(() => {
    form.trigger();
  }, [form, suggestedPersona]);

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {formError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        {hasErrors && (
          <Alert variant="destructive" className="mb-6 bg-destructive/5 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>Please correct the highlighted fields before submitting</AlertDescription>
          </Alert>
        )}
        
        <PersonaNameField />
        
        <div className="space-y-6">
          <StyleSelectionField 
            customStyle={customStyle} 
            onStyleChange={handleStyleChange} 
          />

          <FunctionSelectionField 
            customFunction={customFunction} 
            onFunctionChange={handleFunctionChange} 
          />

          <PromptField 
            generatedPrompt={generatedPrompt} 
            onPromptChange={handlePromptChange}
            error={form.formState.errors.prompt?.message as string}
          />
        </div>
        
        <FormSubmitButton 
          isSubmitting={isSubmitting} 
        />
      </form>
    </Form>
  );
}
