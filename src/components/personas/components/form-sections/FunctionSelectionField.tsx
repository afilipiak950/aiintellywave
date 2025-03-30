
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { predefinedFunctions } from '@/utils/persona-utils';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FunctionSelectionFieldProps {
  customFunction: boolean;
  onFunctionChange: (value: string) => void;
}

export function FunctionSelectionField({ customFunction, onFunctionChange }: FunctionSelectionFieldProps) {
  const form = useFormContext();
  const { error: functionError } = form.getFieldState('function', form.formState);
  const { error: customFunctionError } = form.getFieldState('customFunction', form.formState);
  const hasError = !!functionError || (customFunction && !!customFunctionError);
  
  const maxLength = personaValidationConstraints.customFunction.max;
  const value = form.watch('customFunction') || '';
  const charactersRemaining = maxLength - value.length;
  const selectedFunction = form.watch('function');
  
  // Find the selected function details to display
  const selectedFunctionDetails = predefinedFunctions.find(f => f.id === selectedFunction);
  const displayValue = selectedFunctionDetails 
    ? `${selectedFunctionDetails.name}` 
    : selectedFunction === 'custom' 
      ? 'Custom Function' 
      : 'Select a function';
  
  return (
    <FormField
      control={form.control}
      name="function"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-medium">Function / Intended Use</FormLabel>
          <div className="space-y-2">
            <Select 
              onValueChange={onFunctionChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className={`w-full ${hasError ? 'border-destructive focus:ring-destructive' : ''}`}>
                  <SelectValue placeholder="Select a function" />
                  {hasError && (
                    <div className="absolute right-8 text-destructive">
                      <AlertCircle size={16} />
                    </div>
                  )}
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[300px] overflow-y-auto bg-background">
                {predefinedFunctions.map((func) => (
                  <SelectItem key={func.id} value={func.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{func.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{func.description}</span>
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="custom">
                  <div className="flex flex-col">
                    <span className="font-medium">Custom Function</span>
                    <span className="text-xs text-muted-foreground">Define your own function</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {functionError && <FormMessage>{functionError.message}</FormMessage>}
          </div>
          {customFunction && (
            <FormField
              control={form.control}
              name="customFunction"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Describe your custom function or intended use"
                        {...field}
                        className={customFunctionError ? 'border-destructive focus-visible:ring-destructive' : ''}
                        maxLength={maxLength}
                      />
                    </FormControl>
                    {customFunctionError && (
                      <div className="absolute right-2 top-2 text-destructive">
                        <AlertCircle size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between mt-1">
                    <FormMessage />
                    <span className={`text-xs ${customFunctionError ? 'text-destructive' : 'text-muted-foreground'}`}>
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
