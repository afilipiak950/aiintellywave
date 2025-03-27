
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus } from 'lucide-react';

const MAX_EMAIL_BODIES = 100;

// Define the schema for multiple email bodies
const emailImportSchema = z.object({
  emailBodies: z.array(
    z.object({
      body: z.string().min(10, {
        message: 'Email body must be at least 10 characters.',
      }),
    })
  ).min(1, {
    message: 'At least one email body is required.',
  }).max(MAX_EMAIL_BODIES, {
    message: `Maximum of ${MAX_EMAIL_BODIES} emails allowed.`,
  }),
});

export type EmailImportFormValues = z.infer<typeof emailImportSchema>;

interface EmailImportFormProps {
  onSubmit: (values: EmailImportFormValues) => Promise<void>;
  isProcessing: boolean;
}

export function EmailImportForm({ onSubmit, isProcessing }: EmailImportFormProps) {
  // Form for importing multiple email bodies
  const emailImportForm = useForm<EmailImportFormValues>({
    resolver: zodResolver(emailImportSchema),
    defaultValues: {
      emailBodies: [{ body: '' }],
    },
  });

  // Setup field array for multiple email bodies
  const { fields, append, remove } = useFieldArray({
    control: emailImportForm.control,
    name: "emailBodies",
  });

  const addEmailBody = () => {
    if (fields.length < MAX_EMAIL_BODIES) {
      append({ body: '' });
    }
  };

  const removeEmailBody = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Form {...emailImportForm}>
      <form onSubmit={emailImportForm.handleSubmit(onSubmit)} className="space-y-4">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel className="font-medium">Email Body #{index + 1}</FormLabel>
                  {fields.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeEmailBody(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <FormField
                  control={emailImportForm.control}
                  name={`emailBodies.${index}.body`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste email content here" 
                          className="h-32 font-mono text-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex justify-between items-center pt-2">
          <p className="text-sm text-muted-foreground">
            {fields.length} of {MAX_EMAIL_BODIES} email bodies
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={addEmailBody}
            disabled={fields.length >= MAX_EMAIL_BODIES}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Email
          </Button>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => emailImportForm.reset({ emailBodies: [{ body: '' }] })}>
            Cancel
          </Button>
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Import & Analyze'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { MAX_EMAIL_BODIES, emailImportSchema };
