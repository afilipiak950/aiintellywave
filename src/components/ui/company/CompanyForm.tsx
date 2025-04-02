
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CompanyFormData {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  website?: string;
}

interface CompanyFormProps {
  initialData: CompanyFormData | null;
  onChange: (data: CompanyFormData) => void;
}

export const CompanyForm = ({ initialData, onChange }: CompanyFormProps) => {
  const [formData, setFormData] = useState<CompanyFormData | null>(initialData);

  // Update form data when initialData prop changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!formData) return;
    
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onChange(updatedData);
  };

  if (!formData) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Company Name *</Label>
        <Input 
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input 
            id="contact_email"
            name="contact_email"
            type="email"
            value={formData.contact_email || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input 
            id="contact_phone"
            name="contact_phone"
            value={formData.contact_phone || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input 
            id="city"
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input 
            id="country"
            name="country"
            value={formData.country || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input 
          id="website"
          name="website"
          type="url"
          value={formData.website || ''}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description"
          name="description"
          rows={3}
          value={formData.description || ''}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};
