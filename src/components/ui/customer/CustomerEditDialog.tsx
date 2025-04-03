
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
          console.log('[CustomerEditDialog] Fetching KPI status for customer:', customer.id);
          
          // Fetch the latest status directly from the database with proper error handling
          const { data, error } = await supabase
            .from('company_users')
            .select('is_manager_kpi_enabled')
            .eq('user_id', customer.id);
            
          if (error) {
            console.error('[CustomerEditDialog] Error fetching KPI status:', error);
            toast({
              title: "Error",
              description: "Could not load KPI status. Please try again.",
              variant: "destructive"
            });
            return;
          }
          
          console.log('[CustomerEditDialog] KPI status data from database:', data);
          
          // Handle case where multiple rows are returned (found in logs)
          if (data && data.length > 0) {
            // Check if any record has KPI enabled
            const kpiEnabled = data.some(row => row.is_manager_kpi_enabled === true);
            setIsManagerKpiEnabled(kpiEnabled);
            console.log('[CustomerEditDialog] Manager KPI enabled status loaded:', kpiEnabled);
          } else {
            console.warn('[CustomerEditDialog] No KPI data found for user:', customer.id);
            setIsManagerKpiEnabled(false);
          }
        } catch (err) {
          console.error('[CustomerEditDialog] Unexpected error loading KPI status:', err);
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
      
      console.log('[CustomerEditDialog] Attempting to update is_manager_kpi_enabled to:', newValue);
      console.log('[CustomerEditDialog] Current value:', isManagerKpiEnabled);
      console.log('[CustomerEditDialog] For user:', customer.id);
      
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
      console.log('[CustomerEditDialog] Database update response:', data);
      
      // Only update local state after confirming the DB update was successful
      if (data && data.length > 0) {
        // Update local state to match database
        setIsManagerKpiEnabled(newValue);
        
        toast({
          title: `Manager KPI Dashboard ${newValue ? 'Enabled' : 'Disabled'}`,
          description: `Manager KPI Dashboard has been ${newValue ? 'enabled' : 'disabled'} for this user. They'll need to refresh their browser to see the changes.`,
          duration: 5000
        });
        
        // Notify parent component of the update to refresh the list
        onProfileUpdated();
      } else {
        throw new Error('No confirmation of database update received');
      }
    } catch (error: any) {
      console.error('[CustomerEditDialog] Error updating manager KPI setting:', error);
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

  // Add explicit dialog close handler that ensures proper cleanup
  const handleDialogClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit Customer Profile</DialogTitle>
          <DialogDescription>
            Update customer information and settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-4 p-4 border rounded-lg bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Manager KPI Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Enable the Manager KPI dashboard for this user to view company performance metrics
              </p>
            </div>
            <Switch 
              checked={isManagerKpiEnabled}
              onCheckedChange={handleManagerKpiToggle}
              disabled={isUpdating || isLoading}
              aria-label="Toggle Manager KPI Dashboard"
            />
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            {isManagerKpiEnabled && 
              <p className="text-green-600">
                ✓ Manager KPI Dashboard is currently enabled for this user
              </p>
            }
          </div>
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
            company_size: customer.company_size ? String(customer.company_size) : '', // Convert to string for the form
            company_id: customer.company_id || '',
            company_role: customer.company_role || 'customer',
            linkedin_url: customer.linkedin_url || '',
            notes: customer.notes || ''
          }}
          onProfileUpdated={() => {
            // Ensure we tell parent component to refresh data
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
