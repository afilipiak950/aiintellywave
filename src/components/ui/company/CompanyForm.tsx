
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Company } from './useCompanyEdit';

interface CompanyFormProps {
  initialData: Company;
  onChange: (data: Company) => void;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({ initialData, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...initialData, [name]: value });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Company Name *</Label>
        <Input 
          id="name" 
          name="name" 
          value={initialData.name || ''} 
          onChange={handleInputChange} 
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          value={initialData.description || ''} 
          onChange={handleInputChange}
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input 
            id="contact_email" 
            name="contact_email" 
            type="email"
            value={initialData.contact_email || ''} 
            onChange={handleInputChange} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input 
            id="contact_phone" 
            name="contact_phone" 
            value={initialData.contact_phone || ''} 
            onChange={handleInputChange} 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input 
          id="website" 
          name="website" 
          value={initialData.website || ''} 
          onChange={handleInputChange} 
          placeholder="e.g. www.example.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input 
          id="address" 
          name="address" 
          value={initialData.address || ''} 
          onChange={handleInputChange} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input 
            id="city" 
            name="city" 
            value={initialData.city || ''} 
            onChange={handleInputChange} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input 
            id="postal_code" 
            name="postal_code" 
            value={initialData.postal_code || ''} 
            onChange={handleInputChange} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input 
            id="country" 
            name="country" 
            value={initialData.country || ''} 
            onChange={handleInputChange} 
          />
        </div>
      </div>
    </div>
  );
};
