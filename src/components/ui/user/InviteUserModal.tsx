
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvited?: () => void;
  companyId?: string;
}

const InviteUserModal = ({ isOpen, onClose, onInvited, companyId }: InviteUserModalProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(companyId);
  const { user } = useAuth();
  
  // Fetch companies when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      
      // If companyId is passed as a prop, use it as the selected company
      if (companyId) {
        console.log('[InviteUserModal] Using explicitly passed companyId:', companyId);
        setSelectedCompanyId(companyId);
      }
    }
  }, [isOpen, companyId]);
  
  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      console.log('Companies data received:', data?.length, 'companies');
      setCompanies(data || []);
      
      // If companyId is not set, use the first company
      if (!selectedCompanyId && data && data.length > 0) {
        setSelectedCompanyId(data[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error',
        description: `Failed to load companies: ${error.message}`,
        variant: 'destructive'
      });
    }
  };
  
  const inviteUserDirectly = async (email: string, companyId: string | undefined, role: string) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    
    // Try to use the admin API to create the user first
    try {
      // Generate a random password (user will reset it)
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Create the user in Auth
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          role,
          company_id: companyId,
          invited_by: user?.id
        }
      });
      
      if (userError) {
        console.error('Error creating user:', userError);
        throw userError;
      }
      
      // Track successful invitation
      try {
        await supabase.from('user_activities').insert({
          user_id: user?.id,
          entity_type: 'user',
          entity_id: userData.user.id,
          action: 'invited user',
          details: {
            email,
            role,
            company_id: companyId,
            inviter_email: user?.email
          }
        });
        
        console.log('Activity tracked successfully:', {
          user_id: user?.id,
          entity_type: 'user',
          entity_id: userData.user.id,
          action: 'invited user',
          details: {
            email,
            role,
            company_id: companyId,
            inviter_email: user?.email
          }
        });
      } catch (activityError) {
        console.warn('Failed to track invitation activity:', activityError);
      }
      
      return userData.user;
    } catch (error) {
      console.error('Error in direct invitation method:', error);
      throw error;
    }
  };
  
  const inviteUser = async () => {
    if (!email) {
      toast({
        title: 'Missing information',
        description: 'Please provide an email address',
        variant: 'destructive'
      });
      return;
    }
    
    if (!selectedCompanyId) {
      toast({
        title: 'Missing information',
        description: 'Please select a company',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('[InviteUserModal] Sending invitation with company ID:', selectedCompanyId);
      
      // First, try to use the Edge Function
      try {
        console.log('[InviteUserModal] Invoking function via supabase client');
        const { data, error } = await supabase.functions.invoke('invite-user', {
          body: {
            email,
            companyId: selectedCompanyId,
            role,
            invitedBy: {
              id: user?.id,
              email: user?.email,
              name: user?.firstName ? `${user.firstName} ${user?.lastName || ''}` : user?.email
            }
          }
        });
        
        if (error) throw new Error(`Fehler beim Aufruf der Funktion: ${error.message}`);
        
        if (data && data.success) {
          toast({
            title: 'Success',
            description: `Invitation sent to ${email}`,
          });
          
          if (onInvited) onInvited();
          onClose();
          setEmail('');
          return;
        }
      } catch (functionError) {
        console.error('[InviteUserModal] Error invoking function via client:', functionError);
      }
      
      // If the Edge Function fails, try a direct fetch to the function URL
      try {
        console.log('[InviteUserModal] Falling back to direct fetch');
        const functionUrl = `https://ootziscicbahucatxyme.supabase.co/functions/v1/invite-user`;
        console.log('[InviteUserModal] Calling function at URL:', functionUrl);
        
        const { session } = await supabase.auth.getSession();
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            email,
            companyId: selectedCompanyId,
            role,
            invitedBy: {
              id: user?.id,
              email: user?.email,
              name: user?.firstName ? `${user.firstName} ${user?.lastName || ''}` : user?.email
            }
          })
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (data && data.success) {
          toast({
            title: 'Success',
            description: `Invitation sent to ${email}`,
          });
          
          if (onInvited) onInvited();
          onClose();
          setEmail('');
          return;
        }
      } catch (fetchError) {
        console.error('[InviteUserModal] Error with direct fetch:', fetchError);
      }
      
      // If both methods fail, fall back to direct API calls
      try {
        console.log('[InviteUserModal] Falling back to direct API calls');
        await inviteUserDirectly(email, selectedCompanyId, role);
        
        toast({
          title: 'Success',
          description: `User ${email} has been invited successfully`,
        });
        
        if (onInvited) onInvited();
        onClose();
        setEmail('');
      } catch (directError: any) {
        console.error('Error in direct invitation method:', directError);
        
        // Check for common errors
        if (directError.message?.includes('already exists')) {
          toast({
            title: 'User already exists',
            description: 'The email address is already registered.',
            variant: 'destructive'
          });
        } else if (directError.code === 'not_admin') {
          toast({
            title: 'Permission denied',
            description: 'You do not have admin permissions to invite users.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Error',
            description: directError.message || 'Failed to invite user',
            variant: 'destructive'
          });
        }
      }
    } catch (error: any) {
      console.error('[InviteUserModal] Error inviting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to invite user',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="user@example.com"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company" className="text-right">
              Company
            </Label>
            <Select 
              value={selectedCompanyId} 
              onValueChange={setSelectedCompanyId}
              disabled={!!companyId} // Disable if companyId is passed as a prop
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a company" />
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={inviteUser} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserModal;
