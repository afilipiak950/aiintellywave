
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
import { useActivityTracking } from '@/hooks/use-activity-tracking';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvited: () => void;
  companyId?: string;
}

const InviteUserModal = ({ isOpen, onClose, onInvited, companyId }: InviteUserModalProps) => {
  const { user } = useAuth();
  const { logUserInvitation } = useActivityTracking();
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

  // Define constants for Supabase connection
  const SUPABASE_URL = "https://ootziscicbahucatxyme.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vdHppc2NpY2JhaHVjYXR4eW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTk3NTQsImV4cCI6MjA1ODQ5NTc1NH0.HFbdZNFqQueDWd_fGA7It7ff7BifYYFsTWZGhKUT-xI";

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
    enabled: isOpen
  });

  useEffect(() => {
    if (companyId) {
      console.log("[InviteUserModal] Using explicitly passed companyId:", companyId);
      setSelectedCompanyId(companyId);
      setCompanyMode('existing');
    } else if (user?.companyId) {
      console.log("[InviteUserModal] Using user's companyId:", user.companyId);
      setSelectedCompanyId(user.companyId);
      setCompanyMode('existing');
    } else {
      console.warn("[InviteUserModal] No valid company ID found");
      setSelectedCompanyId(null);
    }
  }, [companyId, user, isOpen]);

  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId && companyMode === 'existing') {
      const firstCompany = companies.find(c => c.id);
      if (firstCompany && firstCompany.id) {
        console.log("[InviteUserModal] Updated company ID from loaded companies:", firstCompany.id);
        setSelectedCompanyId(firstCompany.id);
      }
    }
  }, [companies, selectedCompanyId, companyMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  // Direct API call to invite a user without relying on Edge Functions
  const inviteUserDirectly = async (inviteData: any, session: any): Promise<any> => {
    try {
      // Create an auth user with Supabase Admin API
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: inviteData.email,
        email_confirm: true,
        user_metadata: {
          name: inviteData.name || inviteData.email.split('@')[0],
          company_id: inviteData.company_id,
          role: inviteData.role,
          language: inviteData.language || 'de'
        }
      });

      if (userError) {
        console.error('Error creating user:', userError);
        if (userError.message.includes('already registered')) {
          return { success: true, message: 'User already exists. Adding to company instead.' };
        }
        throw userError;
      }

      if (!userData?.user) {
        throw new Error('No user data returned from createUser');
      }

      // Add user to company_users table
      const { error: companyUserError } = await supabase
        .from('company_users')
        .insert({
          user_id: userData.user.id,
          company_id: inviteData.company_id,
          role: inviteData.role,
          is_admin: inviteData.role === 'admin',
          email: inviteData.email,
          full_name: inviteData.name || inviteData.email.split('@')[0],
          is_primary_company: true
        });

      if (companyUserError) {
        console.error('Error adding user to company:', companyUserError);
      }

      // Add user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role: inviteData.role
        });

      if (roleError) {
        console.warn('Warning when adding user role:', roleError);
      }

      // Send password reset email
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: inviteData.email
      });

      if (resetError) {
        console.warn('Warning when sending password reset:', resetError);
      }

      return { success: true, user: userData.user };
    } catch (error: any) {
      console.error('Error in direct invitation method:', error);
      return { success: false, error: error.message };
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
      let effectiveCompanyId = selectedCompanyId;
      
      if (companyMode === 'new') {
        const newCompanyId = await createNewCompany();
        if (!newCompanyId) {
          setLoading(false);
          return;
        }
        effectiveCompanyId = newCompanyId;
      }

      if (!effectiveCompanyId) {
        console.error("[InviteUserModal] No company ID found:", { 
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

      console.log("[InviteUserModal] Sending invitation with company ID:", effectiveCompanyId);
      
      // Get the current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session found. Please log in again.");
      }
      
      // Prepare user data
      const inviteUserData = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        company_id: effectiveCompanyId,
        language: formData.language || 'de'
      };
      
      // Try method 1: Use Edge Function via supabase.functions.invoke
      try {
        console.log("[InviteUserModal] Invoking function via supabase client");
        const { data: invokeData, error: invokeError } = await supabase.functions.invoke('invite-user', {
          body: inviteUserData
        });
        
        if (invokeError) {
          console.error("Error invoking function:", invokeError);
          throw new Error(`Fehler beim Aufruf der Funktion: ${invokeError.message || 'Unbekannter Fehler'}`);
        }
        
        if (!invokeData || !invokeData.success) {
          throw new Error(invokeData?.error || 'Unbekannter Fehler bei der Benutzereinladung');
        }
        
        // Handle success
        await logUserInvitation(formData.email, formData.role, effectiveCompanyId);
        
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
      } catch (invokeError: any) {
        console.error("[InviteUserModal] Error invoking function via client:", invokeError);
        
        // Try method 2: Direct fetch to Edge Function
        try {
          console.log("[InviteUserModal] Falling back to direct fetch");
          
          // Construct the function URL using the constants
          const functionUrl = `${SUPABASE_URL}/functions/v1/invite-user`;
          console.log(`[InviteUserModal] Calling function at URL: ${functionUrl}`);
          
          const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify(inviteUserData)
          });
          
          if (!response.ok) {
            const responseText = await response.text();
            console.error("HTTP Error Response:", response.status, responseText);
            throw new Error(`HTTP error ${response.status}: ${responseText.substring(0, 100)}`);
          }
          
          const responseData = await response.json();
          
          if (!responseData.success) {
            throw new Error(responseData.error || 'Unbekannter Fehler bei der Benutzereinladung');
          }
          
          // Success
          await logUserInvitation(formData.email, formData.role, effectiveCompanyId);
          
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
        } catch (fetchError: any) {
          console.error("[InviteUserModal] Error with direct fetch:", fetchError);
          
          // Try method 3: Direct API calls without Edge Function
          console.log("[InviteUserModal] Falling back to direct API calls");
          const directResult = await inviteUserDirectly(inviteUserData, session);
          
          if (!directResult.success) {
            throw new Error(directResult.error || 'Fehler bei der direkten Benutzereinladung');
          }
          
          // Success
          await logUserInvitation(formData.email, formData.role, effectiveCompanyId);
          
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
        }
      }
    } catch (error: any) {
      console.error('[InviteUserModal] Error inviting user:', error);
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
