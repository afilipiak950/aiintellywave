
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { SheetFooter } from "@/components/ui/sheet";
import { UserCircle, Loader2 } from 'lucide-react';
import { predefinedStyles, predefinedFunctions } from '@/utils/persona-utils';
import { AIPersona } from '@/types/persona';
import { personaCreationSchema, PersonaCreationFormValues } from '../schemas/persona-form-schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PersonaCreationFormProps {
  suggestedPersona: Partial<AIPersona> | null;
  onSubmit: (values: PersonaCreationFormValues) => Promise<void>;
}

export function PersonaCreationForm({ suggestedPersona, onSubmit }: PersonaCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = useState('style');

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
        
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="style" onClick={() => setActiveTab('style')}>Writing Style</TabsTrigger>
            <TabsTrigger value="function" onClick={() => setActiveTab('function')}>Function / Intended Use</TabsTrigger>
          </TabsList>
          
          {/* Writing Style Tab */}
          <TabsContent value="style" className="pt-4">
            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-2 gap-2">
                    {predefinedStyles.map((style) => (
                      <Button
                        key={style.id}
                        type="button"
                        variant={field.value === style.id ? "default" : "outline"}
                        onClick={() => form.setValue('style', style.id)}
                        className="justify-start h-auto py-2 px-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">{style.name}</div>
                          <div className="text-xs text-muted-foreground">{style.tone}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          {/* Function / Intended Use Tab */}
          <TabsContent value="function" className="pt-4">
            <FormField
              control={form.control}
              name="function"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-2 gap-2">
                    {predefinedFunctions.map((func) => (
                      <Button
                        key={func.id}
                        type="button"
                        variant={field.value === func.id ? "default" : "outline"}
                        onClick={() => form.setValue('function', func.id)}
                        className="justify-start h-auto py-2 px-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">{func.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{func.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        
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
