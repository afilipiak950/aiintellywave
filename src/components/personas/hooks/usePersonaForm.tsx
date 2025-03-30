
import { AIPersona } from '@/types/persona';
import { PersonaCreationFormValues } from '../schemas/persona-form-schema';
import { useFormState } from './form/useFormState';
import { useFormEffects } from './form/useFormEffects';
import { useFormHandlers } from './form/useFormHandlers';

interface UsePersonaFormProps {
  suggestedPersona: Partial<AIPersona> | null;
  onSubmit: (values: PersonaCreationFormValues) => Promise<void>;
}

export function usePersonaForm({ suggestedPersona, onSubmit }: UsePersonaFormProps) {
  // Use the form state hook to manage form state
  const {
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
    setFormError
  } = useFormState({ suggestedPersona });
  
  // Use the form effects hook to handle side effects
  useFormEffects({
    form,
    suggestedPersona,
    customStyle,
    customFunction,
    setGeneratedPrompt
  });
  
  // Use the form handlers hook to handle form events
  const {
    handleStyleChange,
    handleFunctionChange,
    handlePromptChange,
    handleSubmit
  } = useFormHandlers({
    form,
    customStyle,
    setCustomStyle,
    customFunction,
    setCustomFunction,
    generatedPrompt,
    setGeneratedPrompt,
    isSubmitting,
    setIsSubmitting,
    setFormError,
    onSubmit
  });

  return {
    form,
    isSubmitting,
    customStyle,
    customFunction,
    generatedPrompt,
    setGeneratedPrompt,
    handleStyleChange,
    handleFunctionChange,
    handlePromptChange,
    handleSubmit,
    formError,
  };
}
