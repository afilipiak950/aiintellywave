
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormContext } from 'react-hook-form';

interface FormSubmitButtonProps {
  isSubmitting: boolean;
  isValid?: boolean;
}

export function FormSubmitButton({ isSubmitting }: FormSubmitButtonProps) {
  const form = useFormContext();
  const hasErrors = Object.keys(form.formState.errors).length > 0;
  const isDirty = form.formState.isDirty;
  
  return (
    <div className="flex justify-end items-center gap-3">
      {hasErrors && (
        <p className="text-sm text-destructive mr-auto">
          Please fix the validation errors before submitting
        </p>
      )}
      <Button 
        type="submit" 
        disabled={isSubmitting || (!isDirty && !form.formState.isSubmitting)}
        className="min-w-[100px]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Create Persona'
        )}
      </Button>
    </div>
  );
}
