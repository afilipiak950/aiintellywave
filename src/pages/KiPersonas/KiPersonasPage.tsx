
import { useState } from 'react';
import { PlusCircle, UserCircle } from 'lucide-react';
import { usePersonas } from '@/hooks/use-personas';
import { AIPersona } from '@/types/persona';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PersonaCard } from '@/components/personas/PersonaCard';
import { PersonaForm } from '@/components/personas/PersonaForm';
import { EmailIntegrationSection } from '@/components/personas/EmailIntegrationSection';
import { Skeleton } from '@/components/ui/skeleton';

export default function KiPersonasPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { personas, isLoading, createPersona, updatePersona } = usePersonas();

  const handleCreatePersona = (persona: AIPersona) => {
    createPersona(persona);
    setIsCreateDialogOpen(false);
  };

  const handleUpdatePersona = (persona: AIPersona) => {
    updatePersona(persona);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <UserCircle className="h-8 w-8" />
          KI Personas
        </h1>
        <p className="text-muted-foreground">
          Create and manage AI personas for personalized outreach and communications
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Your Personas</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Persona
          </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona) => (
              <PersonaCard 
                key={persona.id} 
                persona={persona} 
                onEdit={handleUpdatePersona} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/30">
            <UserCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No personas created yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create AI personas to streamline your outreach communication with a consistent voice and style
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Persona
            </Button>
          </div>
        )}
      </div>

      <EmailIntegrationSection />

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
