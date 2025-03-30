
import React from 'react';
import { Form } from "@/components/ui/form";
import { AIPersona } from '@/types/persona';
import { PersonaCreationFormValues } from '../../schemas/persona-form-schema';
import { usePersonaForm } from '../../hooks/usePersonaForm';
import { PersonaNameField } from './PersonaNameField';
import { StyleSelectionField } from './StyleSelectionField';
import { FunctionSelectionField } from './FunctionSelectionField';
import { PromptField } from './PromptField';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';

interface PersonaCreationFormProps {
  suggestedPersona: Partial<AIPersona> | null;
  onSubmit: (values: PersonaCreationFormValues) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function PersonaCreationForm({ 
  suggestedPersona, 
  onSubmit, 
  onCancel,
  isEditing = false
}: PersonaCreationFormProps) {
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
  } = usePersonaForm({ 
    suggestedPersona, 
    onSubmit 
  });

  const isDirty = form.formState.isDirty;
  const isSubmitted = form.formState.isSubmitted;
  
  // Only show validation errors if the form has been submitted or fields are dirty
  const shouldShowValidationAlert = isSubmitted && Object.keys(form.formState.errors).length > 0;

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
        
        {shouldShowValidationAlert && (
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
        
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? 'Update Persona' : 'Create Persona'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
