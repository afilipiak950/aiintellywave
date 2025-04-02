
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomerProfileForm from './CustomerProfileForm';
import { UICustomer } from '@/types/customer';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CustomerEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: UICustomer;
  onProfileUpdated: () => void;
}

const CustomerEditDialog = ({
  isOpen,
  onClose,
  customer,
  onProfileUpdated
}: CustomerEditDialogProps) => {
  // Initialize with the customer's current value or default to false
  const [isManagerKpiEnabled, setIsManagerKpiEnabled] = useState<boolean>(
    Boolean(customer.is_manager_kpi_enabled) || false
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Update local state when customer prop changes
  useEffect(() => {
    setIsManagerKpiEnabled(Boolean(customer.is_manager_kpi_enabled) || false);
    console.log('Manager KPI enabled status:', customer.is_manager_kpi_enabled);
  }, [customer]);

  // Debug log for the current state
  useEffect(() => {
    console.log('Current Manager KPI state:', isManagerKpiEnabled);
  }, [isManagerKpiEnabled]);

  const handleManagerKpiToggle = async () => {
    try {
      setIsUpdating(true);
      console.log('Toggling Manager KPI for user:', customer.id);
      console.log('Current value:', isManagerKpiEnabled);
      console.log('New value:', !isManagerKpiEnabled);
      
      // Calculate new value before the update
      const newValue = !isManagerKpiEnabled;
      
      // Update the database
      const { error } = await supabase
        .from('company_users')
        .update({ is_manager_kpi_enabled: newValue })
        .eq('user_id', customer.id);

      if (error) throw error;

      // Update local state only after successful database update
      setIsManagerKpiEnabled(newValue);
      toast({
        title: "KPI Dashboard Updated",
        description: `Manager KPI Dashboard has been ${newValue ? 'enabled' : 'disabled'} for this user.`
      });
      
      // Notify parent component of the update but don't force reload
      onProfileUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit Customer Profile</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Manager KPI Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Enable KPI dashboard for this manager
            </p>
          </div>
          <Switch 
            checked={isManagerKpiEnabled}
            onCheckedChange={handleManagerKpiToggle}
            disabled={isUpdating}
          />
        </div>
        
        <CustomerProfileForm
          customerId={customer.id}
          initialData={{
            first_name: customer.first_name || '',
            last_name: customer.last_name || '',
            email: customer.email || customer.contact_email || '',
            phone: customer.phone || customer.contact_phone || '',
            position: customer.position || '',
            address: customer.address || '',
            department: customer.department || '',
            job_title: customer.job_title || '',
            company_size: customer.company_size || '',
            company_id: customer.company_id || '',
            company_role: customer.company_role || 'customer',
            linkedin_url: customer.linkedin_url || '',
            notes: customer.notes || ''
          }}
          onProfileUpdated={() => {
            onProfileUpdated();
            onClose();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CustomerEditDialog;
