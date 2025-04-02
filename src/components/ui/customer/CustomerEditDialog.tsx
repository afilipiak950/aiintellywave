
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  const [isManagerKpiEnabled, setIsManagerKpiEnabled] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load the initial state when dialog opens or customer changes
  useEffect(() => {
    // Explicitly convert to boolean to handle null/undefined values
    const kpiEnabled = Boolean(customer.is_manager_kpi_enabled);
    setIsManagerKpiEnabled(kpiEnabled);
    console.log('Manager KPI enabled status:', kpiEnabled);
  }, [customer]);

  const handleManagerKpiToggle = async () => {
    try {
      // Set updating state to disable toggle while processing
      setIsUpdating(true);
      
      // Calculate new value before the update
      const newValue = !isManagerKpiEnabled;
      
      console.log('Toggling Manager KPI for user:', customer.id);
      console.log('Current value:', isManagerKpiEnabled);
      console.log('New value:', newValue);
      
      // Update the database with the new value
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
      
      // Notify parent component of the update
      onProfileUpdated();
    } catch (error: any) {
      console.error('Error updating manager KPI setting:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      // Do not change the local state on error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit Customer Profile</DialogTitle>
          <DialogDescription>
            Update customer information and settings.
          </DialogDescription>
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
            aria-label="Toggle Manager KPI Dashboard"
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
