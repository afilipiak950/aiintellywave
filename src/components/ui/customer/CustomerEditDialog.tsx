
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
          
          // Use more detailed logging with clear identifiers
          console.log('[CustomerEditDialog] Customer data:', {
            id: customer.id,
            company_id: customer.company_id
          });
          
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
          
          // Handle case where multiple rows are returned
          if (data && data.length > 0) {
            // Check if any record has KPI enabled - if ANY company has it enabled, show as enabled
            const kpiEnabled = data.some(row => row.is_manager_kpi_enabled === true);
            setIsManagerKpiEnabled(kpiEnabled);
            console.log('[CustomerEditDialog] Manager KPI enabled status determined:', kpiEnabled);
            
            // Log which companies have it enabled for debugging
            if (data.length > 1) {
              const enabledCompanies = data.filter(row => row.is_manager_kpi_enabled).length;
              console.log(`[CustomerEditDialog] User belongs to ${data.length} companies, KPI enabled in ${enabledCompanies}`);
            }
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
      
      // Update all company associations for this user
      // This ensures the setting is applied consistently across all companies
      const { error, data } = await supabase
        .from('company_users')
        .update({ is_manager_kpi_enabled: newValue })
        .eq('user_id', customer.id)
        .select('is_manager_kpi_enabled, company_id');

      if (error) {
        console.error('[CustomerEditDialog] Error updating manager KPI setting:', error);
        throw error;
      }
      
      // Log the complete response for debugging
      console.log('[CustomerEditDialog] Database update response:', data);
      console.log('[CustomerEditDialog] Number of records updated:', data?.length || 0);
      
      // Only update local state after confirming the DB update was successful
      if (data && data.length > 0) {
        // Log the specific companies that were updated
        const companyIds = data.map(record => record.company_id);
        console.log('[CustomerEditDialog] Updated KPI setting for companies:', companyIds);
        
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            {isManagerKpiEnabled ? (
              <p className="text-green-600">
                ✓ Manager KPI Dashboard is currently enabled for this user
              </p>
            ) : (
              <p className="text-gray-500">
                Manager KPI Dashboard is currently disabled for this user
              </p>
            )}
            {isLoading && <p className="text-blue-500">Loading settings...</p>}
            {isUpdating && <p className="text-blue-500">Updating settings...</p>}
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
