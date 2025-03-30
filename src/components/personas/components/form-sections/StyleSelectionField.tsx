
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { predefinedStyles } from '@/utils/persona-utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertCircle } from 'lucide-react';
import { personaValidationConstraints } from "@/utils/form-validation";

interface StyleSelectionFieldProps {
  customStyle: boolean;
  onStyleChange: (value: string) => void;
}

export function StyleSelectionField({ customStyle, onStyleChange }: StyleSelectionFieldProps) {
  const form = useFormContext();
  const { error: styleError, isDirty: styleIsDirty, isTouched: styleIsTouched } = form.getFieldState('style', form.formState);
  const { error: customStyleError, isDirty: customStyleIsDirty, isTouched: customStyleIsTouched } = form.getFieldState('customStyle', form.formState);
  
  // Only show errors if the field has been touched/dirty or the form was submitted
  const isFormSubmitted = form.formState.isSubmitted;
  const showStyleError = !!styleError && (styleIsDirty || styleIsTouched || isFormSubmitted);
  const showCustomStyleError = !!customStyleError && customStyle && (customStyleIsDirty || customStyleIsTouched || isFormSubmitted);
  
  const hasError = showStyleError || showCustomStyleError;
  
  const maxLength = personaValidationConstraints.customStyle.max;
  const value = form.watch('customStyle') || '';
  const charactersRemaining = maxLength - value.length;
  
  return (
    <FormField
      control={form.control}
      name="style"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-medium">Writing Style</FormLabel>
          <div className="space-y-2">
            <Select 
              onValueChange={onStyleChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className={`w-full ${hasError ? 'border-destructive focus:ring-destructive' : ''}`}>
                  <SelectValue placeholder="Select a writing style" />
                  {hasError && (
                    <div className="absolute right-8 text-destructive">
                      <AlertCircle size={16} />
                    </div>
                  )}
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
                <SelectItem value="custom">
                  <div className="flex flex-col">
                    <span className="font-medium">Custom Style</span>
                    <span className="text-xs text-muted-foreground">Define your own style</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {showStyleError && <FormMessage>{styleError.message}</FormMessage>}
          </div>
          {customStyle && (
            <FormField
              control={form.control}
              name="customStyle"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Describe your custom writing style"
                        {...field}
                        className={showCustomStyleError ? 'border-destructive focus-visible:ring-destructive' : ''}
                        maxLength={maxLength}
                      />
                    </FormControl>
                    {showCustomStyleError && (
                      <div className="absolute right-2 top-2 text-destructive">
                        <AlertCircle size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between mt-1">
                    {showCustomStyleError && <FormMessage />}
                    <span className={`text-xs ${showCustomStyleError ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {charactersRemaining} characters remaining
                    </span>
                  </div>
                </FormItem>
              )}
            />
          )}
        </FormItem>
      )}
    />
  );
}
