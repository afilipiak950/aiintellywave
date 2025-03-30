
import { toast } from '@/hooks/use-toast';
import { generatePrompt } from '@/utils/persona-utils';
import { PersonaCreationFormValues } from '@/components/personas/schemas/persona-form-schema';
import { usePersonas } from '@/hooks/use-personas';
import { generateSuggestedPersona } from '@/utils/email-analysis-utils';

export function usePersonaHandlers() {
  const { 
    personas,
    createPersona,
    updatePersona
  } = usePersonas();

  const createPersonaAutomatically = async (suggestedPersona: any) => {
    try {
      console.log("Creating persona automatically with data:", suggestedPersona);
      
      // Create persona data from suggested values
      const personaData = {
        name: suggestedPersona.name,
        function: suggestedPersona.function,
        style: suggestedPersona.style,
        prompt: suggestedPersona.prompt || generatePrompt({
          name: suggestedPersona.name,
          function: suggestedPersona.function,
          style: suggestedPersona.style
        })
      };
      
      const result = await createPersona(personaData);
      console.log("Persona created automatically:", result);
      
      toast({
        title: "Success",
        description: "AI Persona created automatically from email analysis!",
      });
      
      return result;
    } catch (error) {
      console.error('Error creating persona automatically:', error);
      toast({
        title: "Error",
        description: "Failed to create persona automatically. Please try creating manually.",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const updateExistingPersona = async (suggestedPersona: any) => {
    try {
      if (personas.length === 0) return null;
      
      console.log("Updating existing persona with data:", suggestedPersona);
      
      // Get the first persona to update
      const existingPersona = personas[0];
      
      // Update with suggested values
      const result = await updatePersona({
        id: existingPersona.id,
        name: suggestedPersona.name,
        function: suggestedPersona.function,
        style: suggestedPersona.style,
        prompt: suggestedPersona.prompt || generatePrompt({
          name: suggestedPersona.name,
          function: suggestedPersona.function,
          style: suggestedPersona.style
        })
      });
      
      console.log("Persona updated automatically:", result);
      
      toast({
        title: "Persona Updated",
        description: "AI Persona updated automatically from new email analysis!",
      });
      
      return result;
    } catch (error) {
      console.error('Error updating persona:', error);
      toast({
        title: "Update Error", 
        description: "Failed to update persona automatically. Please update manually.",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const handlePersonaSubmit = async (values: PersonaCreationFormValues) => {
    try {
      // Create persona data from form values
      const personaData = {
        name: values.name,
        function: values.function,
        style: values.style,
        prompt: generatePrompt({
          name: values.name,
          function: values.function,
          style: values.style
        })
      };
      
      const result = await createPersona(personaData);
      
      toast({
        title: "Success",
        description: "AI Persona created successfully!",
      });
      
      return result;
    } catch (error) {
      console.error('Error creating persona:', error);
      toast({
        title: "Error",
        description: "Failed to create persona. Please try again.",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  return {
    createPersonaAutomatically,
    updateExistingPersona,
    handlePersonaSubmit
  };
}
