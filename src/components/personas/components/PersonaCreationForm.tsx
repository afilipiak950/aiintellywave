
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { SheetFooter } from "@/components/ui/sheet";
import { UserCircle, Loader2, ChevronDown } from 'lucide-react';
import { predefinedStyles, predefinedFunctions } from '@/utils/persona-utils';
import { AIPersona } from '@/types/persona';
import { personaCreationSchema, PersonaCreationFormValues } from '../schemas/persona-form-schema';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface PersonaCreationFormProps {
  suggestedPersona: Partial<AIPersona> | null;
  onSubmit: (values: PersonaCreationFormValues) => Promise<void>;
}

export function PersonaCreationForm({ suggestedPersona, onSubmit }: PersonaCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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
  React.useEffect(() => {
    if (suggestedPersona) {
      form.setValue('name', suggestedPersona.name || '');
      form.setValue('function', suggestedPersona.function || '');
      form.setValue('style', suggestedPersona.style || '');
    }
  }, [suggestedPersona, form]);

  // Generate AI prompt when style or function changes
  React.useEffect(() => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Persona Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="E.g., Sales Executive, IT Support Specialist"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="style"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Writing Style</FormLabel>
                <Select 
                  onValueChange={handleStyleChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a writing style" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[300px] overflow-y-auto bg-background">
                    {predefinedStyles.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{style.name}</span>
                          <span className="text-xs text-muted-foreground">{style.tone}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">
                      <div className="flex flex-col">
                        <span className="font-medium">Custom Style</span>
                        <span className="text-xs text-muted-foreground">Define your own style</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {customStyle && (
                  <FormField
                    control={form.control}
                    name="customStyle"
                    render={({ field }) => (
                      <FormItem className="mt-3">
                        <FormControl>
                          <Input
                            placeholder="Describe your custom writing style"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="function"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Function / Intended Use</FormLabel>
                <Select 
                  onValueChange={handleFunctionChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a function" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[300px] overflow-y-auto bg-background">
                    {predefinedFunctions.map((func) => (
                      <SelectItem key={func.id} value={func.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{func.name}</span>
                          <span className="text-xs text-muted-foreground truncate">{func.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">
                      <div className="flex flex-col">
                        <span className="font-medium">Custom Function</span>
                        <span className="text-xs text-muted-foreground">Define your own function</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {customFunction && (
                  <FormField
                    control={form.control}
                    name="customFunction"
                    render={({ field }) => (
                      <FormItem className="mt-3">
                        <FormControl>
                          <Input
                            placeholder="Describe your custom function or intended use"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel className="text-base font-medium">AI Prompt</FormLabel>
            <Textarea
              value={generatedPrompt}
              onChange={(e) => setGeneratedPrompt(e.target.value)}
              className="min-h-[150px] resize-none"
              placeholder="Generated prompt will appear here. You can edit it to customize further."
              readOnly={!generatedPrompt}
            />
          </FormItem>
        </div>
        
        <SheetFooter className="pt-6">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Persona...
              </>
            ) : (
              <>
                <UserCircle className="h-4 w-4 mr-2" />
                Create Persona
              </>
            )}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
