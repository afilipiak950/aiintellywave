
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
    const fetchKpiStatus = async () => {
      if (isOpen && customer) {
        try {
          // Fetch the latest status directly from the database
          const { data, error } = await supabase
            .from('company_users')
            .select('is_manager_kpi_enabled')
            .eq('user_id', customer.id)
            .single();
            
          if (error) {
            console.error('Error fetching KPI status:', error);
            return;
          }
          
          // Explicitly convert to boolean to handle null/undefined values
          const kpiEnabled = Boolean(data?.is_manager_kpi_enabled);
          setIsManagerKpiEnabled(kpiEnabled);
          console.log('Manager KPI enabled status loaded:', kpiEnabled);
        } catch (err) {
          console.error('Unexpected error loading KPI status:', err);
        }
      }
    };
    
    fetchKpiStatus();
  }, [isOpen, customer]);

  const handleManagerKpiToggle = async () => {
    if (isUpdating) return; // Prevent multiple clicks while processing

    try {
      // Set updating state to disable toggle while processing
      setIsUpdating(true);
      
      // Calculate new value before the update
      const newValue = !isManagerKpiEnabled;
      
      console.log('Toggling Manager KPI for user:', customer.id);
      console.log('Current value:', isManagerKpiEnabled);
      console.log('New value:', newValue);
      
      // Update the database with the new value - DO NOT update UI state yet
      const { error, data } = await supabase
        .from('company_users')
        .update({ is_manager_kpi_enabled: newValue })
        .eq('user_id', customer.id)
        .select('is_manager_kpi_enabled');

      if (error) {
        throw error;
      }
      
      // Only update local state after confirming the DB update was successful
      console.log('Database update response:', data);
      
      // Verify the update was successful by checking the returned data
      if (data && data.length > 0) {
        const updatedValue = Boolean(data[0].is_manager_kpi_enabled);
        setIsManagerKpiEnabled(updatedValue);
        
        toast({
          title: "KPI Dashboard Updated",
          description: `Manager KPI Dashboard has been ${updatedValue ? 'enabled' : 'disabled'} for this user.`
        });
        
        // Notify parent component of the update
        onProfileUpdated();
      } else {
        throw new Error('No confirmation of database update received');
      }
    } catch (error: any) {
      console.error('Error updating manager KPI setting:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update Manager KPI setting',
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
