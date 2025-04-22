
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, Edit, UserCog, Clock, Tag, Plus, X } from 'lucide-react';
import { useCustomerDetail, useCustomerSubscription } from '@/hooks/use-customer-detail';
import { useCustomerMetrics } from '@/hooks/use-customer-metrics';
import CustomerProfileHeader from '@/components/ui/customer/CustomerProfileHeader';
import CustomerContactInfo from '@/components/ui/customer/CustomerContactInfo';
import CustomerCompanyInfo from '@/components/ui/customer/CustomerCompanyInfo';
import CustomerDetailSkeleton from '@/components/ui/customer/CustomerDetailSkeleton';
import CustomerDetailError from '@/components/ui/customer/CustomerDetailError';
import CustomerEditDialog from '@/components/ui/customer/CustomerEditDialog';
import RoleManagementDialog from '@/components/ui/user/RoleManagementDialog';
import UserActivityPanel from '@/components/ui/user/UserActivityPanel';
import { CustomerMetricsForm } from '@/components/ui/customer/CustomerMetricsForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ErrorBoundary from '@/components/ErrorBoundary';
import { toast } from '@/hooks/use-toast';
import { User } from 'lucide-react';
import { useActivityTracking } from '@/hooks/use-activity-tracking';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import GoogleJobsToggle from '@/components/ui/customer/GoogleJobsToggle';
import { adaptCustomerToUICustomer } from '@/utils/customerTypeAdapter';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  return (
    <ErrorBoundary
      fallback={
        <div className="p-8">
          <div className="flex items-center mb-6">
            <button onClick={() => navigate(-1)} className="mr-4">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">Customer Details</h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-600">
            <h2 className="text-xl font-semibold mb-2">An error occurred loading the customer details</h2>
            <p className="mb-4">There was a problem displaying this customer's information.</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
            <Button className="ml-2" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      }
    >
      <CustomerDetailContent customerId={id} />
    </ErrorBoundary>
  );
};

interface CustomerDetailContentProps {
  customerId?: string;
}

const CustomerDetailContent = ({ customerId }: CustomerDetailContentProps) => {
  const navigate = useNavigate();
  const { logUserActivity, ActivityActions } = useActivityTracking();
  
  useCustomerSubscription(customerId);
  
  const { customer, loading, error, refreshCustomer } = useCustomerDetail(customerId);
  
  const { 
    metrics, 
    loading: metricsLoading, 
    refetchMetrics 
  } = useCustomerMetrics(customer?.company_id);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [savingTag, setSavingTag] = useState(false);
  const [googleJobsEnabled, setGoogleJobsEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (customerId && customer) {
      logUserActivity(
        customerId, 
        'viewed customer profile', 
        `Viewed profile for ${customer.name || 'customer'}`,
        { 
          customer_id: customerId,
          customer_name: customer.name,
          company_id: customer.company_id,
          company_name: customer.company
        }
      );
    }
  }, [customerId, customer, logUserActivity]);

  useEffect(() => {
    const fetchGoogleJobsSettings = async () => {
      if (!customer?.company_id) return;
      
      try {
        const { data, error } = await supabase
          .from('company_features')
          .select('google_jobs_enabled')
          .eq('company_id', customer.company_id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // Not found error is fine
          console.error('Error fetching Google Jobs settings:', error);
          return;
        }
        
        setGoogleJobsEnabled(data?.google_jobs_enabled || false);
      } catch (err) {
        console.error('Exception fetching Google Jobs settings:', err);
      }
    };
    
    fetchGoogleJobsSettings();
  }, [customer?.company_id]);

  const handleBack = () => {
    navigate(-1);
  };
  
  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
    if (customerId) {
      logUserActivity(
        customerId,
        'opened profile edit',
        'Opened customer profile editor',
        { customer_id: customerId }
      );
    }
  };
  
  const handleManageRole = () => {
    setIsRoleDialogOpen(true);
    if (customerId) {
      logUserActivity(
        customerId,
        'opened role management',
        'Opened role management dialog',
        { customer_id: customerId }
      );
    }
  };

  const handleProfileUpdated = async () => {
    console.log('[CustomerDetail] Profile updated, refreshing data...');
    
    if (customerId) {
      await logUserActivity(
        customerId,
        ActivityActions.USER_UPDATED_PROFILE,
        'Customer profile was updated',
        { 
          customer_id: customerId,
          updated_by: 'admin' 
        }
      );
    }
    
    toast({
      title: 'Profile Updated',
      description: 'Customer details have been updated successfully.',
    });
    
    refreshCustomer();
    if (customer?.company_id) {
      refetchMetrics();
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (customerId) {
      logUserActivity(
        customerId,
        'viewed tab',
        `Viewed ${value} tab for customer`,
        { tab: value, customer_id: customerId }
      );
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !customer?.company_id) return;
    
    setSavingTag(true);
    try {
      const currentTags = customer.tags || [];
      
      if (!currentTags.includes(newTag.trim())) {
        const updatedTags = [...currentTags, newTag.trim()];
        
        const { error } = await supabase
          .from('companies')
          .update({ tags: updatedTags })
          .eq('id', customer.company_id);
        
        if (error) throw error;
        
        if (customerId) {
          await logUserActivity(
            customerId,
            'added tag',
            `Added tag "${newTag}" to customer`,
            { 
              customer_id: customerId,
              tag: newTag,
              company_id: customer.company_id
            }
          );
        }
        
        toast({
          title: 'Tag Added',
          description: `Tag "${newTag}" has been added to the customer.`,
        });
        
        setNewTag('');
        refreshCustomer();
      } else {
        toast({
          title: 'Tag Already Exists',
          description: 'This tag is already assigned to the customer.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error adding tag:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add tag',
        variant: 'destructive'
      });
    } finally {
      setSavingTag(false);
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!customer?.company_id) return;
    
    try {
      const currentTags = customer.tags || [];
      const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
      
      const { error } = await supabase
        .from('companies')
        .update({ tags: updatedTags })
        .eq('id', customer.company_id);
      
      if (error) throw error;
      
      if (customerId) {
        await logUserActivity(
          customerId,
          'removed tag',
          `Removed tag "${tagToRemove}" from customer`,
          { 
            customer_id: customerId,
            tag: tagToRemove,
            company_id: customer.company_id
          }
        );
      }
      
      toast({
        title: 'Tag Removed',
        description: `Tag "${tagToRemove}" has been removed from the customer.`,
      });
      
      refreshCustomer();
    } catch (error: any) {
      console.error('Error removing tag:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove tag',
        variant: 'destructive'
      });
    }
  };

  const renderPageHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <button onClick={handleBack} className="mr-4">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">Customer Details</h1>
      </div>
      
      {customer && (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleManageRole}
            className="flex items-center gap-1"
          >
            <UserCog size={16} className="mr-1" />
            Manage Role
          </Button>
          <Button 
            onClick={handleEditProfile}
            className="flex items-center gap-1"
          >
            <Edit size={16} className="mr-1" />
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-8">
        {renderPageHeader()}
        <CustomerDetailSkeleton />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8">
        {renderPageHeader()}
        <CustomerDetailError 
          error={error || 'Customer not found'} 
          onRetry={() => window.location.reload()}
        />
        <button 
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  // Adapt the Customer type to UICustomer for compatibility
  const uiCustomer = adaptCustomerToUICustomer(customer);

  return (
    <div className="p-8">
      {renderPageHeader()}
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <User size={16} />
            Profile
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1">
            <Clock size={16} />
            Activity
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-0">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <CustomerProfileHeader customer={uiCustomer} />
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-gray-500" />
                    Tags
                  </h3>
                  {!isAddingTag ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsAddingTag(true)}
                      className="flex items-center text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Tag
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Input
                        className="h-8 text-sm w-40"
                        placeholder="Enter tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          } else if (e.key === 'Escape') {
                            setIsAddingTag(false);
                            setNewTag('');
                          }
                        }}
                      />
                      <Button 
                        size="sm" 
                        className="h-8 text-xs"
                        onClick={handleAddTag}
                        disabled={!newTag.trim() || savingTag}
                      >
                        Add
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs"
                        onClick={() => {
                          setIsAddingTag(false);
                          setNewTag('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {customer.tags && customer.tags.length > 0 ? (
                    customer.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1 group"
                      >
                        {tag}
                        <X
                          className="h-3 w-3 text-blue-400 cursor-pointer hover:text-blue-700 opacity-70 group-hover:opacity-100"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No tags assigned to this customer yet.</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <CustomerContactInfo customer={customer} />
                <CustomerCompanyInfo customer={customer} />
              </div>
              
              {customer?.company_id && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Features & Integrationen</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Aktivieren oder deaktivieren Sie zusätzliche Funktionen und Integrationen für diesen Kunden.
                  </p>
                  
                  <div className="space-y-4">
                    <GoogleJobsToggle 
                      companyId={customer.company_id}
                      enabled={googleJobsEnabled}
                      onStatusChange={setGoogleJobsEnabled}
                    />
                  </div>
                </div>
              )}
              
              {customer?.company_id && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Track and manage key performance indicators for this customer including conversion rate
                    and appointments with candidates.
                  </p>
                  <CustomerMetricsForm 
                    customerId={customer.company_id}
                    metrics={metrics}
                    onMetricsUpdated={refetchMetrics}
                  />
                </div>
              )}
              
              {customer?.notes && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm whitespace-pre-line">{customer.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-0">
          {customer?.id && (
            <UserActivityPanel userId={customer.id} />
          )}
        </TabsContent>
      </Tabs>
      
      {customer && (
        <CustomerEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          customer={uiCustomer}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
      
      {customer && (
        <RoleManagementDialog
          isOpen={isRoleDialogOpen}
          onClose={() => setIsRoleDialogOpen(false)}
          userId={customer.id}
          onRoleUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
};

export default CustomerDetail;
