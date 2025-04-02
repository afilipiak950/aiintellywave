
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
  const [isLoading, setIsLoading] = useState(true);

  // Load the initial state when dialog opens or customer changes
  useEffect(() => {
    const fetchKpiStatus = async () => {
      if (isOpen && customer) {
        try {
          setIsLoading(true);
          console.log('Fetching KPI status for customer:', customer.id);
          
          // Fetch the latest status directly from the database with proper error handling
          const { data, error } = await supabase
            .from('company_users')
            .select('is_manager_kpi_enabled')
            .eq('user_id', customer.id);
            
          if (error) {
            console.error('Error fetching KPI status:', error);
            toast({
              title: "Error",
              description: "Could not load KPI status. Please try again.",
              variant: "destructive"
            });
            return;
          }
          
          console.log('KPI status data from database:', data);
          
          // Handle case where multiple rows are returned (found in logs)
          if (data && data.length > 0) {
            // Check if any record has KPI enabled
            const kpiEnabled = data.some(row => row.is_manager_kpi_enabled === true);
            setIsManagerKpiEnabled(kpiEnabled);
            console.log('Manager KPI enabled status loaded:', kpiEnabled);
          } else {
            console.warn('No KPI data found for user:', customer.id);
            setIsManagerKpiEnabled(false);
          }
        } catch (err) {
          console.error('Unexpected error loading KPI status:', err);
          toast({
            title: "Error",
            description: "An unexpected error occurred while loading settings.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchKpiStatus();
  }, [isOpen, customer]);

  const handleManagerKpiToggle = async (newValue: boolean) => {
    if (isUpdating) return; // Prevent multiple clicks while processing

    try {
      // Set updating state to disable toggle while processing
      setIsUpdating(true);
      
      console.log('Toggling Manager KPI for user:', customer.id);
      console.log('Current value:', isManagerKpiEnabled);
      console.log('New value:', newValue);
      
      // Update the database - don't use single() as we might have multiple rows
      const { error, data } = await supabase
        .from('company_users')
        .update({ is_manager_kpi_enabled: newValue })
        .eq('user_id', customer.id)
        .select('is_manager_kpi_enabled');

      if (error) {
        throw error;
      }
      
      // Log the response for debugging
      console.log('Database update response:', data);
      
      // Only update local state after confirming the DB update was successful
      if (data && data.length > 0) {
        // Update local state to match database
        setIsManagerKpiEnabled(newValue);
        
        toast({
          title: `Manager KPI Dashboard ${newValue ? 'Enabled' : 'Disabled'}`,
          description: `Manager KPI Dashboard has been ${newValue ? 'enabled' : 'disabled'} for this user.`
        });
        
        // Notify parent component of the update to refresh the list
        onProfileUpdated();
      } else {
        throw new Error('No confirmation of database update received');
      }
    } catch (error: any) {
      console.error('Error updating manager KPI setting:', error);
      // Reset UI state to match the database (previous state)
      setIsManagerKpiEnabled(!newValue);
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
            disabled={isUpdating || isLoading}
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
