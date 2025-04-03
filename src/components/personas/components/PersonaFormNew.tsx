
import React from 'react';
import { AIPersona } from '@/types/persona';
import { PersonaCreationForm } from './form-sections/PersonaCreationForm';
import { PersonaCreationFormValues } from '../schemas/persona-form-schema';

interface PersonaFormProps {
  initialValues?: Partial<AIPersona>;
  onSubmit: (values: AIPersona) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function PersonaForm({ 
  initialValues, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}: PersonaFormProps) {
  const handleFormSubmit = (values: PersonaCreationFormValues) => {
    // Create a cleaned-up object with only fields that exist in the database
    const personaData = {
      ...initialValues as AIPersona,
      name: values.name,
      function: values.customFunction && values.function === 'custom' 
        ? values.customFunction 
        : values.function,
      style: values.customStyle && values.style === 'custom' 
        ? values.customStyle 
        : values.style,
      prompt: values.prompt
    };
    
    onSubmit(personaData);
  };

  const suggestedPersona = initialValues || null;

  return (
    <PersonaCreationForm 
      suggestedPersona={suggestedPersona}
      onSubmit={handleFormSubmit}
      onCancel={onCancel}
      isEditing={isEditing}
    />
  );
}
