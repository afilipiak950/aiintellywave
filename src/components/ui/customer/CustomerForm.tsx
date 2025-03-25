
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CustomerFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  projects: number;
}

interface CustomerFormProps {
  onSubmit: (e: React.FormEvent) => void;
  formData: CustomerFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  loading: boolean;
  onCancel: () => void;
}

const CustomerForm = ({ onSubmit, formData, onChange, loading, onCancel }: CustomerFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6 py-4">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Customer Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter customer name"
            value={formData.name}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              placeholder="Company name"
              value={formData.company}
              onChange={onChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              className="w-full border rounded-md p-2"
              value={formData.status}
              onChange={onChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={onChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Phone number"
              value={formData.phone}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Customer"}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
