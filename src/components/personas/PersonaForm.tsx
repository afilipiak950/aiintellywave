
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AIPersona } from '@/types/persona';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { predefinedStyles, predefinedFunctions, generatePrompt } from '@/utils/persona-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  function: z.string().min(1, {
    message: 'Please select or enter a function.',
  }),
  style: z.string().min(1, {
    message: 'Please select or enter a style.',
  }),
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface PersonaFormProps {
  initialValues?: Partial<AIPersona>;
  onSubmit: (values: AIPersona) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function PersonaForm({ initialValues, onSubmit, onCancel, isEditing = false }: PersonaFormProps) {
  const [activeTab, setActiveTab] = useState<string>('presets');
  const [customStyle, setCustomStyle] = useState('');
  const [customFunction, setCustomFunction] = useState('');

  const defaultValues: FormValues = {
    name: initialValues?.name || '',
    function: initialValues?.function || '',
    style: initialValues?.style || '',
    prompt: initialValues?.prompt || '',
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Generate prompt when function or style changes
  useEffect(() => {
    const style = form.watch('style');
    const func = form.watch('function');
    const name = form.watch('name');
    
    if (style && func && name && !isEditing) {
      const generatedPrompt = generatePrompt({
        name,
        function: func,
        style: style
      });
      
      form.setValue('prompt', generatedPrompt);
    }
  }, [form.watch('style'), form.watch('function'), form.watch('name'), isEditing, form]);

  const handlePresetChange = (field: 'style' | 'function', value: string) => {
    form.setValue(field, value);
    if (field === 'style') setCustomStyle('');
    if (field === 'function') setCustomFunction('');
  };

  const handleCustomStyleSubmit = () => {
    if (customStyle.trim()) {
      form.setValue('style', customStyle);
      setActiveTab('presets');
    }
  };

  const handleCustomFunctionSubmit = () => {
    if (customFunction.trim()) {
      form.setValue('function', customFunction);
      setActiveTab('presets');
    }
  };

  const handleFormSubmit = (values: FormValues) => {
    onSubmit({
      ...initialValues as AIPersona,
      ...values,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persona Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Sales Executive, IT Support Specialist" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Style Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Writing Style</h3>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            <TabsContent value="presets" className="pt-4">
              <div className="grid grid-cols-2 gap-2">
                {predefinedStyles.map((style) => (
                  <Button
                    key={style.id}
                    type="button"
                    variant={form.watch('style') === style.id ? "default" : "outline"}
                    onClick={() => handlePresetChange('style', style.id)}
                    className="justify-start h-auto py-2 px-3"
                  >
                    <div className="text-left">
                      <div className="font-medium">{style.name}</div>
                      <div className="text-xs text-muted-foreground">{style.tone}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="custom" className="pt-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Custom writing style..." 
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                />
                <Button 
                  type="button" 
                  onClick={handleCustomStyleSubmit}
                  disabled={!customStyle.trim()}
                >
                  Add
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          <FormMessage>{form.formState.errors.style?.message}</FormMessage>
        </div>
        
        {/* Function Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Function / Intended Use</h3>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            <TabsContent value="presets" className="pt-4">
              <div className="grid grid-cols-2 gap-2">
                {predefinedFunctions.map((func) => (
                  <Button
                    key={func.id}
                    type="button"
                    variant={form.watch('function') === func.id ? "default" : "outline"}
                    onClick={() => handlePresetChange('function', func.id)}
                    className="justify-start h-auto py-2 px-3"
                  >
                    <div className="text-left">
                      <div className="font-medium">{func.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{func.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="custom" className="pt-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Custom function..." 
                  value={customFunction}
                  onChange={(e) => setCustomFunction(e.target.value)}
                />
                <Button 
                  type="button" 
                  onClick={handleCustomFunctionSubmit}
                  disabled={!customFunction.trim()}
                >
                  Add
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          <FormMessage>{form.formState.errors.function?.message}</FormMessage>
        </div>
        
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Prompt</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Generated prompt will appear here. You can edit it to customize further." 
                  className="h-40 font-mono text-sm"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Update Persona' : 'Create Persona'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
