
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertCircle } from 'lucide-react';
import { personaValidationConstraints } from "@/utils/form-validation";

export function PersonaNameField() {
  const form = useFormContext();
  const { error } = form.getFieldState('name', form.formState);
  const maxLength = personaValidationConstraints.name.max;
  const value = form.watch('name') || '';
  const charactersRemaining = maxLength - value.length;
  
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-medium">Persona Name</FormLabel>
          <div className="space-y-2">
            <div className="relative">
              <FormControl>
                <Input
                  placeholder="E.g., Sales Executive, IT Support Specialist"
                  {...field}
                  className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
                  maxLength={maxLength}
                />
              </FormControl>
              {error && (
                <div className="absolute right-2 top-2 text-destructive">
                  <AlertCircle size={16} />
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <FormMessage />
              <span className={`text-xs ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
                {charactersRemaining} characters remaining
              </span>
            </div>
          </div>
        </FormItem>
      )}
    />
  );
}
