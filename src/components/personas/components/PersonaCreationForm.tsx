
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

interface PersonaCreationFormProps {
  suggestedPersona: Partial<AIPersona> | null;
  onSubmit: (values: PersonaCreationFormValues) => Promise<void>;
}

export function PersonaCreationForm({ suggestedPersona, onSubmit }: PersonaCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  const form = useForm<PersonaCreationFormValues>({
    resolver: zodResolver(personaCreationSchema),
    defaultValues: {
      name: suggestedPersona?.name || '',
      function: suggestedPersona?.function || '',
      style: suggestedPersona?.style || '',
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
    
    if (style && func) {
      const selectedStyle = predefinedStyles.find(s => s.id === style);
      const selectedFunction = predefinedFunctions.find(f => f.id === func);
      
      if (selectedStyle && selectedFunction) {
        const prompt = `Act as a professional ${selectedFunction.name} specialist${name ? ` named ${name}` : ''}.
  
Write in a ${selectedStyle.tone} tone that's appropriate for ${selectedFunction.description}.

Your communication should be:
- Clear and concise
- Focused on the recipient's needs
- Helpful and actionable
- Professional while maintaining the ${selectedStyle.name} style

This persona is specifically designed for ${selectedFunction.description} communications.`;
        
        setGeneratedPrompt(prompt);
      }
    }
  }, [form.watch('style'), form.watch('function'), form.watch('name')]);

  const handleSubmit = async (values: PersonaCreationFormValues) => {
    try {
      setIsSubmitting(true);
      // Add the generated prompt to the values
      const dataToSubmit = {
        ...values,
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
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
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
                  </SelectContent>
                </Select>
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
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
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
                  </SelectContent>
                </Select>
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
