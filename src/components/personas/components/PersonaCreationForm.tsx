
import React from 'react';
import { Form } from "@/components/ui/form";
import { AIPersona } from '@/types/persona';
import { PersonaCreationFormValues } from '../schemas/persona-form-schema';
import { usePersonaForm } from '../hooks/usePersonaForm';
import { PersonaNameField } from './form-sections/PersonaNameField';
import { StyleSelectionField } from './form-sections/StyleSelectionField';
import { FunctionSelectionField } from './form-sections/FunctionSelectionField';
import { PromptField } from './form-sections/PromptField';
import { FormSubmitButton } from './form-sections/FormSubmitButton';

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
    handleSubmit
  } = usePersonaForm({ suggestedPersona, onSubmit });

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedPrompt(e.target.value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
          />
        </div>
        
        <FormSubmitButton 
          isSubmitting={isSubmitting} 
          isValid={form.formState.isValid} 
        />
      </form>
    </Form>
  );
}
