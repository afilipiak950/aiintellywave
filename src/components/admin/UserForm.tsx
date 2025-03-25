
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Company {
  id: string;
  name: string;
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  userForm: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    company_id: string;
    is_company_admin: boolean;
    role: 'admin' | 'manager' | 'employee';
  };
  isEditing: boolean;
  companies: Company[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onSwitchChange: (name: string, checked: boolean) => void;
  onSubmit: () => void;
}

const UserForm = ({
  isOpen,
  onClose,
  userForm,
  isEditing,
  companies,
  onInputChange,
  onSelectChange,
  onSwitchChange,
  onSubmit,
}: UserFormProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the user details below'
              : 'Enter the details for the new user'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={userForm.email}
                onChange={onInputChange}
                placeholder="user@example.com"
                required
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="password">
                {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={userForm.password}
                onChange={onInputChange}
                placeholder={isEditing ? '••••••••' : 'Enter password'}
                required={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={userForm.first_name}
                onChange={onInputChange}
                placeholder="First name"
              />
            </div>
            
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={userForm.last_name}
                onChange={onInputChange}
                placeholder="Last name"
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={userForm.role} 
                onValueChange={(value) => onSelectChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="company_id">Company</Label>
              <Select 
                value={userForm.company_id} 
                onValueChange={(value) => onSelectChange('company_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {userForm.company_id && userForm.role !== 'admin' && (
              <div className="col-span-2 flex items-center space-x-2">
                <Switch
                  id="is_company_admin"
                  checked={userForm.is_company_admin}
                  onCheckedChange={(checked) => onSwitchChange('is_company_admin', checked)}
                />
                <Label htmlFor="is_company_admin">
                  Company Manager
                </Label>
              </div>
            )}
            
            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={userForm.is_active}
                onCheckedChange={(checked) => onSwitchChange('is_active', checked)}
              />
              <Label htmlFor="is_active">
                Active Account
              </Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onSubmit}
            className="bg-primary text-white"
          >
            {isEditing ? 'Update User' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
