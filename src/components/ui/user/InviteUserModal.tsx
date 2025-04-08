
import { useState, useEffect } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { fetchCompanies } from '@/services/companyService';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvited: () => void;
  companyId?: string;
}

const InviteUserModal = ({ isOpen, onClose, onInvited, companyId }: InviteUserModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companyMode, setCompanyMode] = useState<'existing' | 'new'>('existing');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'customer',
    language: 'de'
  });

  // Fetch companies for dropdown
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
    enabled: isOpen, // Only fetch when modal is open
  });

  // When the component mounts or companyId changes, determine the effective company ID
  useEffect(() => {
    // First priority: explicitly passed companyId
    if (companyId) {
      console.log("Using explicitly passed companyId:", companyId);
      setSelectedCompanyId(companyId);
    } 
    // Second priority: user's company ID 
    else if (user?.companyId) {
      console.log("Using user's companyId:", user.companyId);
      setSelectedCompanyId(user.companyId);
    } 
    // No valid company ID found
    else {
      console.warn("No valid company ID found");
      setSelectedCompanyId(null);
    }
  }, [companyId, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Function to create a new company
  const createNewCompany = async (): Promise<string | null> => {
    if (!newCompanyName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Firmennamen ein.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: newCompanyName,
          description: `Created for user invitation on ${new Date().toLocaleString()}`
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Erfolg",
        description: `Unternehmen "${newCompanyName}" wurde erfolgreich erstellt.`,
      });

      return data.id;
    } catch (error: any) {
      console.error('Error creating company:', error);
      toast({
        title: "Fehler",
        description: `Fehler beim Erstellen des Unternehmens: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }
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

    setLoading(true);

    try {
      // Determine company ID to use
      let effectiveCompanyId = selectedCompanyId;
      
      // If in 'new' mode, create a new company first
      if (companyMode === 'new') {
        const newCompanyId = await createNewCompany();
        if (!newCompanyId) {
          setLoading(false);
          return; // Stop if company creation failed
        }
        effectiveCompanyId = newCompanyId;
      }

      // Validate that we have a company ID before proceeding
      if (!effectiveCompanyId) {
        console.error("Keine Unternehmen-ID gefunden:", { 
          passedCompanyId: companyId, 
          userCompanyId: user?.companyId,
          selectedCompanyId,
          companyMode
        });
        
        toast({
          title: "Fehler",
          description: "Unternehmen-ID nicht gefunden. Bitte wählen Sie ein Unternehmen aus oder erstellen Sie ein neues.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log("Benutzer wird eingeladen mit Unternehmen-ID:", effectiveCompanyId);

      // Send invitation with the effective company ID
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

  // Debug company ID issue
  console.log("InviteUserModal props:", {
    passedCompanyId: companyId,
    userCompanyId: user?.companyId,
    selectedCompanyId,
    availableCompanies: companies?.length
  });

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
          
          {/* Company selection - new or existing */}
          <div className="space-y-2">
            <Label>Unternehmen</Label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Button
                type="button"
                variant={companyMode === "existing" ? "default" : "outline"}
                onClick={() => setCompanyMode("existing")}
                className="w-full"
              >
                Bestehendes Unternehmen
              </Button>
              <Button
                type="button"
                variant={companyMode === "new" ? "default" : "outline"}
                onClick={() => setCompanyMode("new")}
                className="w-full"
              >
                Neues Unternehmen
              </Button>
            </div>

            {companyMode === "new" ? (
              <div className="space-y-2">
                <Input
                  id="newCompanyName"
                  placeholder="Name des neuen Unternehmens"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Select
                  value={selectedCompanyId || ''}
                  onValueChange={setSelectedCompanyId}
                  disabled={isLoadingCompanies}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingCompanies ? "Wird geladen..." : "Unternehmen auswählen"} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
          
          {/* Show warning if no company is selected in existing mode */}
          {companyMode === "existing" && !selectedCompanyId && (
            <div className="border border-red-300 bg-red-50 p-3 rounded-md text-red-800 text-sm">
              Warnung: Bitte wählen Sie ein Unternehmen aus, um fortzufahren.
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (companyMode === "existing" && !selectedCompanyId) || (companyMode === "new" && !newCompanyName.trim())}
            >
              {loading ? "Wird eingeladen..." : "Einladung senden"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserModal;
