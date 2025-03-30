
import React from 'react';
import { Button } from '@/components/ui/button';
import { SheetFooter } from "@/components/ui/sheet";
import { Loader2, UserCircle } from 'lucide-react';

interface FormSubmitButtonProps {
  isSubmitting: boolean;
  isValid: boolean;
}

export function FormSubmitButton({ isSubmitting, isValid }: FormSubmitButtonProps) {
  return (
    <SheetFooter className="pt-6">
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting || !isValid}
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
  );
}
