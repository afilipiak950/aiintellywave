
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { predefinedStyles, predefinedFunctions } from '@/utils/persona-utils';
import { PersonaCreationFormValues } from '../../schemas/persona-form-schema';
import { AIPersona } from '@/types/persona';

interface UseFormEffectsProps {
  form: UseFormReturn<PersonaCreationFormValues>;
  suggestedPersona: Partial<AIPersona> | null;
  customStyle: boolean;
  customFunction: boolean;
  setGeneratedPrompt: (prompt: string) => void;
}

export function useFormEffects({
  form,
  suggestedPersona,
  customStyle,
  customFunction,
  setGeneratedPrompt,
}: UseFormEffectsProps) {
  
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
  }, [suggestedPersona, form, setGeneratedPrompt]);

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
    form,
    setGeneratedPrompt
  ]);
}
