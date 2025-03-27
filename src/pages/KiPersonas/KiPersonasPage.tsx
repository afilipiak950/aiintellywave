
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, UserCircle } from 'lucide-react';
import { usePersonas } from '@/hooks/use-personas';
import { AIPersona } from '@/types/persona';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PersonaCard } from '@/components/personas/PersonaCard';
import { PersonaForm } from '@/components/personas/PersonaForm';
import { EmailIntegrationSection } from '@/components/personas/EmailIntegrationSection';
import { Skeleton } from '@/components/ui/skeleton';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { AnimatedAgents } from '@/components/ui/animated-agents';

export default function KiPersonasPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { personas = [], isLoading, createPersona, updatePersona } = usePersonas();

  const handleCreatePersona = (persona: AIPersona) => {
    createPersona(persona);
    setIsCreateDialogOpen(false);
  };

  const handleUpdatePersona = (persona: AIPersona) => {
    updatePersona(persona);
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
    <div className="container mx-auto py-6 space-y-8 max-w-7xl relative">
      {/* Background effects - AI agents and floating elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <AnimatedAgents />
        <FloatingElements />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col space-y-1 relative z-10"
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
        className="space-y-6 relative z-10"
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
        className="relative z-10"
      >
        <EmailIntegrationSection />
      </motion.div>

      {/* Create Persona Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Persona</DialogTitle>
          </DialogHeader>
          <PersonaForm
            onSubmit={handleCreatePersona}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
