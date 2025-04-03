
import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, UserCircle } from 'lucide-react';
import { usePersonas } from '@/hooks/use-personas';
import { AIPersona } from '@/types/persona';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PersonaCard } from '@/components/personas/PersonaCard';
import { PersonaCreationForm } from '@/components/personas/components/PersonaCreationForm';
import { EmailIntegrationSection } from '@/components/personas/EmailIntegrationSection';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedBackgroundWrapper } from '@/components/mira-ai/AnimatedBackgroundWrapper';
import { PersonaCreationFormValues } from '@/components/personas/schemas/persona-form-schema';

export default function KiPersonasPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { personas = [], isLoading, createPersona, updatePersona } = usePersonas();
  const [suggestedPersona, setSuggestedPersona] = useState(null);

  const handleCreatePersona = async (values: PersonaCreationFormValues) => {
    startTransition(() => {
      createPersona({
        name: values.name,
        function: values.customFunction && values.function === 'custom' ? values.customFunction : values.function,
        style: values.customStyle && values.style === 'custom' ? values.customStyle : values.style,
        prompt: values.prompt
      });
      setIsCreateDialogOpen(false);
    });
  };

  const handleUpdatePersona = (persona: AIPersona) => {
    startTransition(() => {
      // Remove any fields not in the database schema
      const { id, name, function: funcValue, style, prompt } = persona;
      updatePersona({
        id,
        name,
        function: funcValue,
        style,
        prompt
      });
    });
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <AnimatedBackgroundWrapper>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col space-y-1"
      >
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          <UserCircle className="h-8 w-8 text-primary" />
          KI Personas
        </h1>
        <p className="text-muted-foreground">
          Create and manage AI personas for personalized outreach and communications
        </p>
      </motion.div>

      <motion.div 
        className="space-y-6"
        initial="hidden"
        animate="show"
        variants={container}
        transition={{ delayChildren: 0.2 }}
      >
        <div className="flex justify-between items-center">
          <motion.h2 variants={item} className="text-2xl font-bold tracking-tight">Your Personas</motion.h2>
          <motion.div variants={item}>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300"
              disabled={isPending}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Persona
            </Button>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-36" />
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        ) : personas.length > 0 ? (
          <motion.div 
            variants={container}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {personas.map((persona) => (
              <motion.div 
                key={persona.id} 
                variants={item}
                whileHover={{ y: -8, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <PersonaCard 
                  persona={persona} 
                  onEdit={handleUpdatePersona} 
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            variants={item}
            className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/30"
          >
            <UserCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No personas created yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create AI personas to streamline your outreach communication with a consistent voice and style
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Persona
            </Button>
          </motion.div>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <EmailIntegrationSection />
      </motion.div>

      {/* Create Persona Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Persona</DialogTitle>
          </DialogHeader>
          <PersonaCreationForm
            suggestedPersona={suggestedPersona}
            onSubmit={handleCreatePersona}
          />
        </DialogContent>
      </Dialog>
    </AnimatedBackgroundWrapper>
  );
}
