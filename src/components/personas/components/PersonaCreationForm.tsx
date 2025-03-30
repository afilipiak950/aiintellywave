
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
import { Alert, AlertTitle } from "@/components/ui/alert";
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
    setGeneratedPrompt,
    handleStyleChange,
    handleFunctionChange,
    handleSubmit,
    formError
  } = usePersonaForm({ suggestedPersona, onSubmit });

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedPrompt(e.target.value);
  };

  // Ensure form is validated on first render
  useEffect(() => {
    form.trigger();
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {formError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{formError}</AlertTitle>
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
