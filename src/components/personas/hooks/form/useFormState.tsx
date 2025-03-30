
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AIPersona } from '@/types/persona';
import { personaCreationSchema, PersonaCreationFormValues } from '../../schemas/persona-form-schema';

interface UseFormStateProps {
  suggestedPersona: Partial<AIPersona> | null;
}

export function useFormState({ suggestedPersona }: UseFormStateProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [customStyle, setCustomStyle] = useState<boolean>(false);
  const [customFunction, setCustomFunction] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const form = useForm<PersonaCreationFormValues>({
    resolver: zodResolver(personaCreationSchema),
    mode: 'onTouched', // Only validate fields after they've been touched
    defaultValues: {
      name: suggestedPersona?.name || '',
      function: suggestedPersona?.function || '',
      style: suggestedPersona?.style || '',
      customStyle: '',
      customFunction: '',
      prompt: suggestedPersona?.prompt || '',
    },
  });

  return {
    form,
    isSubmitting,
    setIsSubmitting,
    customStyle,
    setCustomStyle,
    customFunction,
    setCustomFunction,
    generatedPrompt,
    setGeneratedPrompt,
    formError,
    setFormError,
  };
}
