
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Customer } from '@/hooks/customers/types';
import { adaptCustomerToUICustomer } from '@/utils/customerTypeAdapter';
import { UICustomer } from '@/types/customer';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<UICustomer | null>(null);
  const [initialCustomer, setInitialCustomer] = useState<UICustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [enableSearchStrings, setEnableSearchStrings] = useState(false);
  const [jobOffersEnabled, setJobOffersEnabled] = useState(false);

  // Fix customer type by applying the adapter
  const handleFetchCustomer = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          description,
          contact_email,
          contact_phone,
          city,
          country,
          address,
          website,
          created_at,
          updated_at,
          tags,
          industry,
          logo_url,
          enable_search_strings,
          postal_code,
          job_offers_enabled
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Add a default status since it's missing from the database
      const customerWithStatus = {
        ...data,
        status: 'active'  // Default status
      } as Customer;
      
      // Use the adapter to convert the Customer to UICustomer
      const adaptedCustomer = adaptCustomerToUICustomer(customerWithStatus);
      
      if (adaptedCustomer) {
        setCustomer(adaptedCustomer);
        setInitialCustomer(adaptedCustomer);
        setEnableSearchStrings(data?.enable_search_strings || false);
        setJobOffersEnabled(data?.job_offers_enabled || false);
      } else {
        throw new Error('Could not adapt customer data');
      }
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      toast({
        title: "Error",
        description: `Failed to load customer: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    handleFetchCustomer();
  }, [handleFetchCustomer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomer(prevCustomer => {
      if (!prevCustomer) return prevCustomer;
      return { ...prevCustomer, [name]: value };
    });
  };

  const handleToggleSearchStrings = async (checked: boolean) => {
    if (!customer?.id) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('companies')
        .update({ enable_search_strings: checked })
        .eq('id', customer.id);
      
      if (error) throw error;
      
      setEnableSearchStrings(checked);
      setCustomer(prevCustomer => {
        if (!prevCustomer) return prevCustomer;
        return { ...prevCustomer, enable_search_strings: checked };
      });
      
      toast({
        title: "Success",
        description: "Search strings setting updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating search strings setting:', error);
      toast({
        title: "Error",
        description: `Failed to update search strings setting: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJobOffers = async (checked: boolean) => {
    if (!customer?.id) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('companies')
        .update({ job_offers_enabled: checked })
        .eq('id', customer.id);
      
      if (error) throw error;
      
      setJobOffersEnabled(checked);
      setCustomer(prevCustomer => {
        if (!prevCustomer) return prevCustomer;
        return { ...prevCustomer, job_offers_enabled: checked };
      });
      
      toast({
        title: "Success",
        description: "Job offers setting updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating job offers setting:', error);
      toast({
        title: "Error",
        description: `Failed to update job offers setting: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!customer?.id) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('companies')
        .update({
          name: customer.name,
          description: customer.description,
          contact_email: customer.contact_email,
          contact_phone: customer.contact_phone,
          city: customer.city,
          country: customer.country,
          address: customer.address,
          website: customer.website,
          // status: customer.status,
          tags: customer.tags
        })
        .eq('id', customer.id);
      
      if (error) throw error;
      
      setEditing(false);
      setInitialCustomer({ ...customer });
      toast({
        title: "Success",
        description: "Customer updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast({
        title: "Error",
        description: `Failed to update customer: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!customer?.id) return;
    
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', customer.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Customer deleted successfully.",
      });
      navigate('/admin/customers');
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: `Failed to delete customer: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading customer details...</div>;
  }

  if (!customer) {
    return <div>Customer not found.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <CardDescription>View and manage customer information.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={customer.name || ''}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                type="email"
                id="contact_email"
                name="contact_email"
                value={customer.contact_email || ''}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                value={customer.contact_phone || ''}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                type="url"
                id="website"
                name="website"
                value={customer.website || ''}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                type="text"
                id="city"
                name="city"
                value={customer.city || ''}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                type="text"
                id="country"
                name="country"
                value={customer.country || ''}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                type="text"
                id="address"
                name="address"
                value={customer.address || ''}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={customer.description || ''}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="enable-search-strings">Enable Search Strings</Label>
            <Switch
              id="enable-search-strings"
              checked={enableSearchStrings}
              onCheckedChange={handleToggleSearchStrings}
              disabled={!editing}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="job-offers-enabled">Enable Job Offers</Label>
            <Switch
              id="job-offers-enabled"
              checked={jobOffersEnabled}
              onCheckedChange={handleToggleJobOffers}
              disabled={!editing}
            />
          </div>
          <div className="flex justify-end gap-2">
            {editing ? (
              <>
                <Button variant="secondary" onClick={() => {
                  setEditing(false);
                  setCustomer({ ...initialCustomer } as UICustomer);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                  Delete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetail;
