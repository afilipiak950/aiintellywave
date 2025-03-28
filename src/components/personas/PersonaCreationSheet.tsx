
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { predefinedStyles, predefinedFunctions } from '@/utils/persona-utils';
import { UserCircle } from 'lucide-react';
import { AIPersona } from '@/types/persona';

// Persona creation form schema
const personaCreationSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  function: z.string().min(1, { message: 'Please select a function.' }),
  style: z.string().min(1, { message: 'Please select a style.' }),
});

export type PersonaCreationFormValues = z.infer<typeof personaCreationSchema>;

interface PersonaCreationSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  aggregatedAnalysis: any;
  suggestedPersona: Partial<AIPersona> | null;
  onSubmit: (values: PersonaCreationFormValues) => Promise<void>;
}

export function PersonaCreationSheet({ 
  isOpen, 
  onOpenChange, 
  aggregatedAnalysis, 
  suggestedPersona,
  onSubmit
}: PersonaCreationSheetProps) {
  // Form for persona creation
  const form = useForm<PersonaCreationFormValues>({
    resolver: zodResolver(personaCreationSchema),
    defaultValues: {
      name: suggestedPersona?.name || '',
      function: suggestedPersona?.function || '',
      style: suggestedPersona?.style || '',
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

  const handleSubmit = async (values: PersonaCreationFormValues) => {
    await onSubmit(values);
  };

  if (!aggregatedAnalysis) return null;

  return (
    <SheetContent className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Create KI Persona from Analysis</SheetTitle>
        <SheetDescription>
          Create a new persona based on the analysis of {aggregatedAnalysis?.analysisCount || 0} emails
        </SheetDescription>
      </SheetHeader>
      
      <div className="mt-6">
        <div className="bg-primary/10 p-4 rounded-md mb-6">
          <h3 className="font-semibold text-primary mb-2">Analysis Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Dominant Tone:</span>
              <span className="font-medium">{aggregatedAnalysis.dominantTone}</span>
            </div>
            <div className="flex justify-between">
              <span>Writing Style:</span>
              <span className="font-medium">{aggregatedAnalysis.dominantStyle}</span>
            </div>
            <div className="flex justify-between">
              <span>Formality:</span>
              <span className="font-medium">{Math.round(aggregatedAnalysis.metrics.formality)}/10</span>
            </div>
            <div className="flex justify-between">
              <span>Persuasiveness:</span>
              <span className="font-medium">{Math.round(aggregatedAnalysis.metrics.persuasiveness)}/10</span>
            </div>
            <div className="flex justify-between">
              <span>Clarity:</span>
              <span className="font-medium">{Math.round(aggregatedAnalysis.metrics.clarity)}/10</span>
            </div>
          </div>
        </div>
        
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
              <Button type="submit" className="w-full">
                <UserCircle className="h-4 w-4 mr-2" />
                Create Persona
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </div>
    </SheetContent>
  );
}

export { personaCreationSchema };
