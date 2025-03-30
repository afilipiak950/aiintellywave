
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { SheetFooter } from "@/components/ui/sheet";
import { UserCircle, Loader2 } from 'lucide-react';
import { predefinedStyles, predefinedFunctions } from '@/utils/persona-utils';
import { AIPersona } from '@/types/persona';
import { personaCreationSchema, PersonaCreationFormValues } from '../schemas/persona-form-schema';

interface PersonaCreationFormProps {
  suggestedPersona: Partial<AIPersona> | null;
  onSubmit: (values: PersonaCreationFormValues) => Promise<void>;
}

export function PersonaCreationForm({ suggestedPersona, onSubmit }: PersonaCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  const handleSubmit = async (values: PersonaCreationFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting persona:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persona Name</FormLabel>
              <FormControl>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="function"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Communication Function</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                >
                  <option value="" disabled>Select a function</option>
                  {predefinedFunctions.map((func) => (
                    <option key={func.id} value={func.id}>
                      {func.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Communication Style</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                >
                  <option value="" disabled>Select a style</option>
                  {predefinedStyles.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name} - {style.tone}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <SheetFooter className="pt-6">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
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
