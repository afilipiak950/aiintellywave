
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

interface StyleSelectionFieldProps {
  customStyle: boolean;
  onStyleChange: (value: string) => void;
}

export function StyleSelectionField({ customStyle, onStyleChange }: StyleSelectionFieldProps) {
  const form = useFormContext();
  
  return (
    <FormField
      control={form.control}
      name="style"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-medium">Writing Style</FormLabel>
          <Select 
            onValueChange={onStyleChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a writing style" />
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
          {customStyle && (
            <FormField
              control={form.control}
              name="customStyle"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormControl>
                    <Input
                      placeholder="Describe your custom writing style"
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
