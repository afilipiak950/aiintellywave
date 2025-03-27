
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';

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
        <ScrollArea className="max-h-[400px] pr-3">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <div className="flex items-center">
                  <p className="text-sm font-medium">Email Body #{index + 1}</p>
                </div>
                <FormField
                  control={emailImportForm.control}
                  name={`emailBodies.${index}.body`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste email content here" 
                          className="h-24 font-mono text-sm resize-none border border-gray-300"
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
        
        <div className="flex justify-between items-center border-t pt-4 mt-4">
          <p className="text-xs text-muted-foreground">
            {fields.length} of {MAX_EMAIL_BODIES} email bodies
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEmailBody}
            disabled={fields.length >= MAX_EMAIL_BODIES}
            className="h-8"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Another Email
          </Button>
        </div>
        
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => emailImportForm.reset({ emailBodies: [{ body: '' }] })}>
            Cancel
          </Button>
          <Button type="submit" disabled={isProcessing} className="bg-primary text-white">
            {isProcessing ? 'Processing...' : 'Import & Analyze'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { MAX_EMAIL_BODIES, emailImportSchema };
