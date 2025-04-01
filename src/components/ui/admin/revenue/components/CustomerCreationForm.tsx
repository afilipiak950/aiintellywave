
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CustomerCreationFormProps {
  onSuccess: () => void;
}

const CustomerCreationForm = ({ onSuccess }: CustomerCreationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Create the customer in the companies table
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: name.trim(),
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null
        })
        .select()
        .single();
      
      if (companyError) {
        throw companyError;
      }
      
      toast({
        title: "Success",
        description: "Customer created successfully"
      });
      
      // Important: Call onSuccess to refresh the revenue table
      onSuccess();
      
      // Clear form fields
      setName('');
      setContactEmail('');
      setContactPhone('');
    } catch (error: any) {
      console.error("Error creating customer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Customer Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter customer name"
          disabled={loading}
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="Enter contact email"
          disabled={loading}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="contactPhone">Contact Phone</Label>
        <Input
          id="contactPhone"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="Enter contact phone"
          disabled={loading}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          type="button" 
          onClick={onSuccess}
          disabled={loading}
          size="sm"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          size="sm"
        >
          {loading ? 'Creating...' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerCreationForm;
