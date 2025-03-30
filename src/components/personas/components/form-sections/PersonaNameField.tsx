
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertCircle } from 'lucide-react';
import { personaValidationConstraints } from "@/utils/form-validation";

export function PersonaNameField() {
  const form = useFormContext();
  const { error, isDirty, isTouched } = form.getFieldState('name', form.formState);
  
  // Only show errors if the field has been touched/dirty or the form was submitted
  const isFormSubmitted = form.formState.isSubmitted;
  const showError = !!error && (isDirty || isTouched || isFormSubmitted);
  
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
                  className={showError ? 'border-destructive focus-visible:ring-destructive' : ''}
                  maxLength={maxLength}
                />
              </FormControl>
              {showError && (
                <div className="absolute right-2 top-2 text-destructive">
                  <AlertCircle size={16} />
                </div>
              )}
            </div>
            <div className="flex justify-between">
              {showError && <FormMessage />}
              <span className={`text-xs ${showError ? 'text-destructive' : 'text-muted-foreground'}`}>
                {charactersRemaining} characters remaining
              </span>
            </div>
          </div>
        </FormItem>
      )}
    />
  );
}
