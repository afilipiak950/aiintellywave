
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

interface FunctionSelectionFieldProps {
  customFunction: boolean;
  onFunctionChange: (value: string) => void;
}

export function FunctionSelectionField({ customFunction, onFunctionChange }: FunctionSelectionFieldProps) {
  const form = useFormContext();
  
  return (
    <FormField
      control={form.control}
      name="function"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-medium">Function / Intended Use</FormLabel>
          <Select 
            onValueChange={onFunctionChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a function" />
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
          {customFunction && (
            <FormField
              control={form.control}
              name="customFunction"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormControl>
                    <Input
                      placeholder="Describe your custom function or intended use"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
