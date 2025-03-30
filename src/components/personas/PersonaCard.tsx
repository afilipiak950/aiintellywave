
import { useState } from 'react';
import { AIPersona } from '@/types/persona';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Copy, MessageSquare } from 'lucide-react';
import { usePersonas } from '@/hooks/use-personas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PersonaForm from './PersonaForm';
import { toast } from '@/hooks/use-toast';
import { predefinedStyles, predefinedFunctions } from '@/utils/persona-utils';

interface PersonaCardProps {
  persona: AIPersona;
  onEdit: (persona: AIPersona) => void;
}

export function PersonaCard({ persona, onEdit }: PersonaCardProps) {
  const { deletePersona } = usePersonas();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = () => {
    deletePersona(persona.id);
    setIsDeleteConfirmOpen(false);
  };

  const handleEdit = (updatedPersona: AIPersona) => {
    onEdit(updatedPersona);
    setIsEditDialogOpen(false);
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(persona.prompt);
    toast({
      title: 'Prompt copied',
      description: 'The prompt has been copied to your clipboard',
    });
  };

  // Get style and function names for display
  const styleName = predefinedStyles.find(s => s.id === persona.style)?.name || persona.style;
  const functionName = predefinedFunctions.find(f => f.id === persona.function)?.name || persona.function;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{persona.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">{styleName}</Badge>
          <Badge variant="outline">{functionName}</Badge>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="bg-muted p-3 rounded-md text-sm h-32 overflow-auto">
          <pre className="whitespace-pre-wrap font-sans">{persona.prompt}</pre>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyPromptToClipboard}>
            <Copy className="h-3.5 w-3.5 mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Use
          </Button>
        </div>
        
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Persona</DialogTitle>
            </DialogHeader>
            <p className="py-4">Are you sure you want to delete this persona? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Persona</DialogTitle>
          </DialogHeader>
          <PersonaForm 
            initialValues={persona} 
            onSubmit={handleEdit}
            onCancel={() => setIsEditDialogOpen(false)}
            isEditing
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
