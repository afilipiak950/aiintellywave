
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  projects: number;
  role: string;
  password?: string;
}

interface CustomerFormProps {
  formData: FormData;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
  onCancel?: () => void;
  showPasswordField?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  formData,
  onChange,
  onSubmit,
  loading = false,
  onCancel,
  showPasswordField = false
}) => {
  const [localFormData, setLocalFormData] = useState<FormData>(formData);
  const [role, setRole] = useState<string>(formData.role || 'customer');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFormData(prev => ({ ...prev, [name]: value }));
    
    if (onChange) {
      onChange(e);
    }
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    setLocalFormData(prev => ({ ...prev, role: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="John Doe"
          value={localFormData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          name="company"
          placeholder="Acme Inc."
          value={localFormData.company}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john.doe@example.com"
          value={localFormData.email}
          onChange={handleChange}
          required
        />
      </div>

      {showPasswordField && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={localFormData.password || ''}
            onChange={handleChange}
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          placeholder="+1 (555) 123-4567"
          value={localFormData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Input
          id="status"
          name="status"
          placeholder="Status"
          value={localFormData.status}
          onChange={handleChange}
          readOnly
          disabled
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <input type="hidden" name="role" value={role} />
        <Select defaultValue={role} onValueChange={handleRoleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Customer'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
