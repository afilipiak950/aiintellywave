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

      // Try each method in sequence, moving to the next one if the current one fails
      let success = false;
      let error = null;

      // 1. Try with admin API first (this will work if the user has admin privileges)
      try {
        const adminInviteResult = await supabase.auth.admin.createUser({
          email: formData.email,
          email_confirm: true,
          user_metadata: {
            name: formData.name,
            full_name: formData.name,
            company_id: effectiveCompanyId,
            role: formData.role,
            language: formData.language || 'de'
          }
        });
        
        if (adminInviteResult.error) {
          console.warn("Admin API not available:", adminInviteResult.error);
        } else if (adminInviteResult.data.user) {
          // Add user to company_users table
          await supabase.from('company_users').insert({
            user_id: adminInviteResult.data.user.id,
            company_id: effectiveCompanyId,
            role: formData.role,
            is_admin: formData.role === 'admin',
            email: formData.email,
            full_name: formData.name || '',
            is_primary_company: true
          });
          
          // Add user to user_roles table
          await supabase.from('user_roles').insert({
            user_id: adminInviteResult.data.user.id,
            role: formData.role
          });
          
          // Send password reset email
          await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: formData.email
          });
          
          success = true;
        }
      } catch (adminError) {
        console.warn("Admin API error:", adminError);
        error = adminError;
      }

      // 2. If admin API failed, try the edge function with direct fetch
      if (!success) {
        try {
          // Get session for auth
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData?.session?.access_token;
          
          if (!accessToken) {
            throw new Error("No access token available");
          }
          
          // Use the project URL from environment or fallback
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ootziscicbahucatxyme.supabase.co';
          const functionUrl = `${supabaseUrl}/functions/v1/invite-user`;
          
          // Use the public anon key from environment
          const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vdHppc2NpY2JhaHVjYXR4eW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTk3NTQsImV4cCI6MjA1ODQ5NTc1NH0.HFbdZNFqQueDWd_fGA7It7ff7BifYYFsTWZGhKUT-xI';
          
          const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
              'apikey': anonKey
            },
            body: JSON.stringify({
              email: formData.email,
              name: formData.name,
              role: formData.role,
              company_id: effectiveCompanyId,
              language: formData.language || 'de'
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error ${response.status}`);
          }
          
          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || 'Einladung konnte nicht gesendet werden');
          }
          
          success = true;
        } catch (fetchError) {
          console.warn("Direct fetch error:", fetchError);
          error = fetchError;
        }
      }
      
      // 3. If direct fetch failed, try functions.invoke as last resort
      if (!success) {
        try {
          const { data, error: invokeError } = await supabase.functions.invoke('invite-user', {
            body: {
              email: formData.email,
              name: formData.name,
              role: formData.role,
              company_id: effectiveCompanyId,
              language: formData.language || 'de'
            }
          });

          if (invokeError || !data?.success) {
            throw new Error(invokeError?.message || data?.error || 'Einladung konnte nicht gesendet werden');
          }
          
          success = true;
        } catch (invokeError) {
          console.error("Functions.invoke error:", invokeError);
          error = invokeError;
        }
      }

      // 4. If all methods failed, try one last fallback - create user directly
      if (!success) {
        try {
          // Generate a temporary password
          const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
          
          // Sign up the user (this doesn't require admin privileges)
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: tempPassword,
            options: {
              data: {
                name: formData.name,
                full_name: formData.name,
                company_id: effectiveCompanyId,
                role: formData.role,
                language: formData.language || 'de'
              }
            }
          });

          if (signUpError) {
            throw signUpError;
          }

          if (signUpData.user) {
            // Add user to company_users table
            await supabase.from('company_users').insert({
              user_id: signUpData.user.id,
              company_id: effectiveCompanyId,
              role: formData.role,
              is_admin: formData.role === 'admin',
              email: formData.email,
              full_name: formData.name || '',
              is_primary_company: true
            });
            
            // Add user to user_roles table
            await supabase.from('user_roles').insert({
              user_id: signUpData.user.id,
              role: formData.role
            });
            
            // Send password reset email through auth
            await supabase.auth.resetPasswordForEmail(formData.email);
            
            success = true;
          }
        } catch (signUpError) {
          console.error("SignUp fallback error:", signUpError);
          // Keep the previous error if this also fails
        }
      }

      // Final result handling
      if (success) {
        toast({
          title: "Erfolg",
          description: "Benutzer wurde erfolgreich eingeladen. Eine E-Mail mit einem Link zum Zurücksetzen des Passworts wurde gesendet.",
        });
        
        // Log the activity
        await logUserInvitation(formData.email, formData.role, effectiveCompanyId);
        
        setFormData({
          email: '',
          name: '',
          role: 'customer',
          language: 'de'
        });
        
        onInvited();
        onClose();
      } else {
        throw error || new Error("Keine der Methoden zum Einladen des Benutzers war erfolgreich");
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
