
import { toast } from '@/hooks/use-toast';
import { UseFormReturn } from 'react-hook-form';
import { PersonaCreationFormValues } from '../../schemas/persona-form-schema';
import { validateLength, validateCharacters, validationPatterns } from '@/utils/form-validation';

interface UseFormHandlersProps {
  form: UseFormReturn<PersonaCreationFormValues>;
  customStyle: boolean;
  setCustomStyle: (value: boolean) => void;
  customFunction: boolean;
  setCustomFunction: (value: boolean) => void;
  generatedPrompt: string;
  setGeneratedPrompt: (prompt: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  setFormError: (error: string | null) => void;
  onSubmit: (values: PersonaCreationFormValues) => Promise<void>;
}

export function useFormHandlers({
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
  onSubmit,
}: UseFormHandlersProps) {
  
  const handleStyleChange = (value: string) => {
    const isCustom = value === 'custom';
    setCustomStyle(isCustom);
    form.setValue('style', value, { shouldValidate: true });
    
    // Clear custom style if not using custom
    if (!isCustom) {
      form.setValue('customStyle', '', { shouldValidate: false });
    }
  };

  const handleFunctionChange = (value: string) => {
    const isCustom = value === 'custom';
    setCustomFunction(isCustom);
    form.setValue('function', value, { shouldValidate: true });
    
    // Clear custom function if not using custom
    if (!isCustom) {
      form.setValue('customFunction', '', { shouldValidate: false });
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setGeneratedPrompt(newValue);
    form.setValue('prompt', newValue, { shouldValidate: true });
  };

  const handleSubmit = async (values: PersonaCreationFormValues) => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      // Additional validation
      if (customStyle && !values.customStyle?.trim()) {
        form.setError('customStyle', { 
          type: 'manual', 
          message: 'Custom style description is required' 
        });
        setIsSubmitting(false);
        return;
      }
      
      if (customFunction && !values.customFunction?.trim()) {
        form.setError('customFunction', { 
          type: 'manual', 
          message: 'Custom function description is required' 
        });
        setIsSubmitting(false);
        return;
      }

      // Validate the generated prompt using our validation utility
      if (!validateLength(generatedPrompt, 10, 2000)) {
        form.setError('prompt', {
          type: 'manual',
          message: generatedPrompt.length < 10 
            ? 'Prompt must be at least 10 characters' 
            : 'Prompt is too long (maximum 2000 characters)'
        });
        setIsSubmitting(false);
        return;
      }

      // Check for HTML content using the improved pattern
      if (!validateCharacters(generatedPrompt, validationPatterns.noHtml)) {
        form.setError('prompt', {
          type: 'manual',
          message: 'Prompt contains disallowed HTML content'
        });
        setIsSubmitting(false);
        return;
      }
      
      // Update prompt value from the state before submitting
      values.prompt = generatedPrompt;
      
      // Prepare the final data
      const dataToSubmit = {
        ...values,
        // If using custom values, use those instead of predefined IDs
        style: customStyle ? values.customStyle : values.style,
        function: customFunction ? values.customFunction : values.function,
        prompt: generatedPrompt
      };
      
      await onSubmit(dataToSubmit);
      form.reset({
        name: '',
        function: '',
        style: '',
        customStyle: '',
        customFunction: '',
        prompt: ''
      });
      setGeneratedPrompt('');
    } catch (error) {
      console.error('Error submitting persona:', error);
      setFormError('Failed to create persona. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleStyleChange,
    handleFunctionChange,
    handlePromptChange,
    handleSubmit
  };
}
