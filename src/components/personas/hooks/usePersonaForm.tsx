
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { predefinedStyles, predefinedFunctions } from '@/utils/persona-utils';
import { AIPersona } from '@/types/persona';
import { personaCreationSchema, PersonaCreationFormValues } from '../schemas/persona-form-schema';
import { validateLength, validateCharacters, validationPatterns } from '@/utils/form-validation';

interface UsePersonaFormProps {
  suggestedPersona: Partial<AIPersona> | null;
  onSubmit: (values: PersonaCreationFormValues) => Promise<void>;
}

export function usePersonaForm({ suggestedPersona, onSubmit }: UsePersonaFormProps) {
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

  // Update form values when suggested persona changes
  useEffect(() => {
    if (suggestedPersona) {
      form.setValue('name', suggestedPersona.name || '', { shouldValidate: false });
      form.setValue('function', suggestedPersona.function || '', { shouldValidate: false });
      form.setValue('style', suggestedPersona.style || '', { shouldValidate: false });
      if (suggestedPersona.prompt) {
        setGeneratedPrompt(suggestedPersona.prompt);
        form.setValue('prompt', suggestedPersona.prompt, { shouldValidate: false });
      }
    }
  }, [suggestedPersona, form]);

  // Generate AI prompt when style or function changes
  useEffect(() => {
    const style = form.watch('style');
    const func = form.watch('function');
    const name = form.watch('name');
    const customStyleText = form.watch('customStyle');
    const customFunctionText = form.watch('customFunction');
    
    // Don't generate if no style or function selected yet
    if (!style || !func) return;
    
    // Find the selected style and function
    const selectedStyle = customStyle && customStyleText 
      ? { name: customStyleText, tone: customStyleText } 
      : predefinedStyles.find(s => s.id === style);
      
    const selectedFunction = customFunction && customFunctionText 
      ? { name: customFunctionText, description: customFunctionText } 
      : predefinedFunctions.find(f => f.id === func);
    
    if ((selectedStyle || customStyle) && (selectedFunction || customFunction)) {
      const styleName = selectedStyle ? selectedStyle.name : customStyleText;
      const styleTone = selectedStyle ? selectedStyle.tone : customStyleText;
      const functionName = selectedFunction ? selectedFunction.name : customFunctionText;
      const functionDesc = selectedFunction ? selectedFunction.description : customFunctionText;
      
      const prompt = `Act as a professional ${functionName} specialist${name ? ` named ${name}` : ''}.
  
Write in a ${styleTone} tone that's appropriate for ${functionDesc}.

Your communication should be:
- Clear and concise
- Focused on the recipient's needs
- Helpful and actionable
- Professional while maintaining the ${styleName} style

This persona is specifically designed for ${functionDesc} communications.`;
        
      setGeneratedPrompt(prompt);
      form.setValue('prompt', prompt, { shouldValidate: false });
    }
  }, [
    form.watch('style'),
    form.watch('function'),
    form.watch('name'),
    form.watch('customStyle'),
    form.watch('customFunction'),
    customStyle,
    customFunction,
    form
  ]);

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
