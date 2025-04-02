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

  useEffect(() => {
    const fetchKpiStatus = async () => {
      if (!isOpen || !customer?.id) return;
      
      try {
        setIsLoading(true);
        console.log('[CustomerEditDialog] Fetching KPI status for customer ID:', customer.id);
        
        const { data, error } = await supabase
          .from('company_users')
          .select('is_manager_kpi_enabled, company_id')
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
        
        console.log('[CustomerEditDialog] KPI status data:', data);
        
        if (data && data.length > 0) {
          const kpiEnabled = data.some(row => row.is_manager_kpi_enabled === true);
          console.log('[CustomerEditDialog] Manager KPI enabled:', kpiEnabled);
          setIsManagerKpiEnabled(kpiEnabled);
          
          if (data.length > 1) {
            const enabledCount = data.filter(row => row.is_manager_kpi_enabled).length;
            const companies = data.map(row => row.company_id);
            console.log(`[CustomerEditDialog] User has ${data.length} company associations:`, companies);
            console.log(`[CustomerEditDialog] KPI enabled in ${enabledCount} companies`);
          }
        } else {
          console.warn('[CustomerEditDialog] No company associations found for user:', customer.id);
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
    };
    
    fetchKpiStatus();
  }, [isOpen, customer]);

  const handleManagerKpiToggle = async (newValue: boolean) => {
    if (isUpdating || !customer?.id) return;
    
    try {
      setIsUpdating(true);
      
      console.log('[CustomerEditDialog] Updating is_manager_kpi_enabled to:', newValue);
      console.log('[CustomerEditDialog] Current value:', isManagerKpiEnabled);
      console.log('[CustomerEditDialog] For user ID:', customer.id);
      
      const { error, data } = await supabase
        .from('company_users')
        .update({ is_manager_kpi_enabled: newValue })
        .eq('user_id', customer.id)
        .select('is_manager_kpi_enabled, company_id');

      if (error) {
        console.error('[CustomerEditDialog] Error updating KPI setting:', error);
        throw new Error(`Failed to update Manager KPI setting: ${error.message}`);
      }
      
      console.log('[CustomerEditDialog] Update response:', data);
      
      if (!data || data.length === 0) {
        throw new Error('No database records were updated');
      }
      
      setIsManagerKpiEnabled(newValue);
      
      const updatedCompanies = data.map(record => record.company_id);
      console.log(`[CustomerEditDialog] Updated KPI setting for ${data.length} companies:`, updatedCompanies);
      
      toast({
        title: `Manager KPI Dashboard ${newValue ? 'Enabled' : 'Disabled'}`,
        description: `Manager KPI Dashboard has been ${newValue ? 'enabled' : 'disabled'} for this user. They'll need to refresh their browser to see the changes.`,
        duration: 5000
      });
      
      onProfileUpdated();
    } catch (error: any) {
      console.error('[CustomerEditDialog] Error updating KPI setting:', error);
      
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
