
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CustomerCreationFormProps {
  initialData?: any; // Added to support editing existing customers
  onSubmit: (customer: any) => Promise<void> | void;
  onCancel: () => void;
}

const CustomerCreationForm = ({ initialData, onSubmit, onCancel }: CustomerCreationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || '');
  const [contactEmail, setContactEmail] = useState(initialData?.contact_email || '');
  const [contactPhone, setContactPhone] = useState(initialData?.contact_phone || '');
  const [setupFee, setSetupFee] = useState(initialData?.setup_fee?.toString() || '0');
  const [monthlyFlatFee, setMonthlyFlatFee] = useState(initialData?.monthly_flat_fee?.toString() || '0');
  const [pricePerAppointment, setPricePerAppointment] = useState(initialData?.price_per_appointment?.toString() || '0');
  const [appointmentsPerMonth, setAppointmentsPerMonth] = useState(initialData?.appointments_per_month?.toString() || '0');
  const [conditions, setConditions] = useState(initialData?.conditions || '');
  
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
      
      // Prepare customer data
      const customerData = {
        name: name.trim(),
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
        setup_fee: parseFloat(setupFee) || 0,
        monthly_flat_fee: parseFloat(monthlyFlatFee) || 0,
        price_per_appointment: parseFloat(pricePerAppointment) || 0,
        appointments_per_month: parseInt(appointmentsPerMonth) || 0,
        conditions: conditions.trim() || 'Standard'
      };
      
      // Call the onSubmit function with the customer data
      await onSubmit(customerData);
      
    } catch (error: any) {
      console.error("Error in customer form:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process customer data",
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
      
      <div className="grid md:grid-cols-2 gap-4">
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
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="setupFee">Setup Fee (€)</Label>
          <Input
            id="setupFee"
            type="number"
            value={setupFee}
            onChange={(e) => setSetupFee(e.target.value)}
            placeholder="0"
            disabled={loading}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="monthlyFlatFee">Monthly Flat Fee (€)</Label>
          <Input
            id="monthlyFlatFee"
            type="number"
            value={monthlyFlatFee}
            onChange={(e) => setMonthlyFlatFee(e.target.value)}
            placeholder="0"
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="pricePerAppointment">Price per Appointment (€)</Label>
          <Input
            id="pricePerAppointment"
            type="number"
            value={pricePerAppointment}
            onChange={(e) => setPricePerAppointment(e.target.value)}
            placeholder="0"
            disabled={loading}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="appointmentsPerMonth">Appointments per Month</Label>
          <Input
            id="appointmentsPerMonth"
            type="number"
            value={appointmentsPerMonth}
            onChange={(e) => setAppointmentsPerMonth(e.target.value)}
            placeholder="0"
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="conditions">Conditions</Label>
        <Input
          id="conditions"
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
          placeholder="Standard"
          disabled={loading}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          type="button" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
        >
          {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Customer' : 'Create Customer')}
        </Button>
      </div>
    </form>
  );
};

export default CustomerCreationForm;
