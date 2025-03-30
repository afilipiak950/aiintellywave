
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { predefinedStyles, predefinedFunctions } from '@/utils/persona-utils';
import { AIPersona } from '@/types/persona';
import { personaCreationSchema, PersonaCreationFormValues } from '../schemas/persona-form-schema';

interface UsePersonaFormProps {
  suggestedPersona: Partial<AIPersona> | null;
  onSubmit: (values: PersonaCreationFormValues) => Promise<void>;
}

export function usePersonaForm({ suggestedPersona, onSubmit }: UsePersonaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [customStyle, setCustomStyle] = useState<boolean>(false);
  const [customFunction, setCustomFunction] = useState<boolean>(false);
  
  const form = useForm<PersonaCreationFormValues>({
    resolver: zodResolver(personaCreationSchema),
    defaultValues: {
      name: suggestedPersona?.name || '',
      function: suggestedPersona?.function || '',
      style: suggestedPersona?.style || '',
      customStyle: '',
      customFunction: '',
    },
  });

  // Update form values when suggested persona changes
  useEffect(() => {
    if (suggestedPersona) {
      form.setValue('name', suggestedPersona.name || '');
      form.setValue('function', suggestedPersona.function || '');
      form.setValue('style', suggestedPersona.style || '');
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
    if (!style && !func) return;
    
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
    }
  }, [
    form.watch('style'),
    form.watch('function'),
    form.watch('name'),
    form.watch('customStyle'),
    form.watch('customFunction'),
    customStyle,
    customFunction
  ]);

  const handleStyleChange = (value: string) => {
    setCustomStyle(value === 'custom');
    form.setValue('style', value);
  };

  const handleFunctionChange = (value: string) => {
    setCustomFunction(value === 'custom');
    form.setValue('function', value);
  };

  const handleSubmit = async (values: PersonaCreationFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Prepare the final data
      const dataToSubmit = {
        ...values,
        // If using custom values, use those instead of predefined IDs
        style: customStyle ? values.customStyle : values.style,
        function: customFunction ? values.customFunction : values.function,
        prompt: generatedPrompt
      };
      
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Error submitting persona:', error);
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
    handleSubmit,
  };
}
