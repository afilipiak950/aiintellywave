
import React from 'react';
import { AIPersona } from '@/types/persona';
import { PersonaCreationForm } from './form-sections/PersonaCreationForm';
import { PersonaCreationFormValues } from '../schemas/persona-form-schema';

interface PersonaFormProps {
  initialValues?: Partial<AIPersona>;
  onSubmit: (values: AIPersona) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function PersonaForm({ 
  initialValues, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}: PersonaFormProps) {
  const handleFormSubmit = (values: PersonaCreationFormValues) => {
    onSubmit({
      ...initialValues as AIPersona,
      ...values,
    });
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
