
import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvited: () => void;
  companyId?: string;
}

const InviteUserModal = ({ isOpen, onClose, onInvited, companyId }: InviteUserModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'customer',
    language: 'de'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const inviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast({
        title: "Fehler",
        description: "E-Mail-Adresse ist erforderlich.",
        variant: "destructive"
      });
      return;
    }

    // Überprüfen und Loggen der Unternehmen-ID
    const effectiveCompanyId = companyId || user?.companyId;
    
    if (!effectiveCompanyId) {
      console.error("Keine Unternehmen-ID gefunden:", { 
        companyId: companyId, 
        userCompanyId: user?.companyId 
      });
      
      toast({
        title: "Fehler",
        description: "Unternehmen-ID nicht gefunden. Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
      return;
    }

    console.log("Benutzer wird eingeladen mit Unternehmen-ID:", effectiveCompanyId);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          company_id: effectiveCompanyId,
          language: formData.language || 'de'
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Einladung konnte nicht gesendet werden');
      }

      toast({
        title: "Erfolg",
        description: "Benutzer wurde erfolgreich eingeladen. Eine E-Mail mit einem Link zum Zurücksetzen des Passworts wurde gesendet.",
      });
      
      setFormData({
        email: '',
        name: '',
        role: 'customer',
        language: 'de'
      });
      
      onInvited();
      onClose();
    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Einladen des Benutzers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neuen Benutzer einladen</DialogTitle>
          <DialogDescription>
            Senden Sie eine Einladung an einen neuen Benutzer per E-Mail. 
            Der Benutzer erhält einen Link zum Einrichten seines Passworts.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={inviteUser} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="beispiel@domain.de"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              name="name"
              placeholder="Vollständiger Name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rolle</Label>
            <Select
              value={formData.role}
              onValueChange={handleSelectChange('role')}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Rolle auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="customer">Kunde</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Sprache</Label>
            <Select
              value={formData.language}
              onValueChange={handleSelectChange('language')}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Sprache auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="en">Englisch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Wird eingeladen..." : "Einladung senden"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserModal;
