
import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import {
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  UserCogIcon,
  CheckCircleIcon,
  XCircleIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';

type User = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string;
  is_active?: boolean;
  avatar_url?: string | null;
  company?: { id: string; name: string } | null;
  company_role?: 'admin' | 'manager' | 'employee' | null;
  roles?: { role: string }[];
};

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    is_active: true,
    company_id: '',
    is_company_admin: false,
    role: 'employee' as 'admin' | 'manager' | 'employee',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

  // Fetch users and companies on component mount
  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // First get all users from auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Get user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      // Get company users
      const { data: companyUsers, error: companyError } = await supabase
        .from('company_users')
        .select('user_id, company_id, role, companies:company_id(id, name)');
      
      if (companyError) throw companyError;
      
      // Combine all data
      const mergedUsers = authUsers.users.map(authUser => {
        const profile = profiles.find(p => p.id === authUser.id) || {};
        const roles = userRoles.filter(r => r.user_id === authUser.id);
        const companyUser = companyUsers.find(cu => cu.user_id === authUser.id);
        
        return {
          id: authUser.id,
          email: authUser.email || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          is_active: profile.is_active !== false,
          avatar_url: profile.avatar_url || '',
          company: companyUser ? {
            id: companyUser.company_id,
            name: companyUser.companies?.name || 'Unknown Company'
          } : null,
          company_role: companyUser?.role as 'admin' | 'manager' | 'employee' || null,
          roles: roles,
        };
      });

      setUsers(mergedUsers as User[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase.from('companies').select('id, name');
      
      if (error) throw error;
      
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch companies',
        variant: 'destructive',
      });
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      // Edit mode
      setSelectedUser(user);
      setUserForm({
        email: user.email || '',
        password: '', // Don't include password for edit
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_active: user.is_active !== false,
        company_id: user.company?.id || '',
        is_company_admin: user.company_role === 'manager',
        role: user.roles?.some(r => r.role === 'admin') ? 'admin' : 
              user.company_role === 'manager' ? 'manager' : 'employee',
      });
    } else {
      // Create mode
      setSelectedUser(null);
      setUserForm({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        is_active: true,
        company_id: '',
        is_company_admin: false,
        role: 'employee',
      });
    }
    setIsDialogOpen(true);
  };

  const handleDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setUserForm({
      ...userForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setUserForm({
      ...userForm,
      [name]: value,
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setUserForm({
      ...userForm,
      [name]: checked,
    });
  };

  const handleCreateUser = async () => {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userForm.email,
        password: userForm.password,
        email_confirm: true,
      });
      
      if (authError) throw authError;
      
      const userId = authData.user.id;
      
      // 2. Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: userForm.first_name,
          last_name: userForm.last_name,
          is_active: userForm.is_active,
        })
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      // 3. Add role if admin
      if (userForm.role === 'admin') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        
        if (roleError) throw roleError;
      }
      
      // 4. Add company association if selected
      if (userForm.company_id) {
        const { error: companyError } = await supabase
          .from('company_users')
          .insert({
            user_id: userId,
            company_id: userForm.company_id,
            role: userForm.role === 'admin' ? 'admin' : (userForm.is_company_admin ? 'manager' : 'employee'),
          });
        
        if (companyError) throw companyError;
      }
      
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      // 1. Update user email if changed
      if (selectedUser.email !== userForm.email) {
        const { error: authError } = await supabase.auth.admin.updateUserById(selectedUser.id, {
          email: userForm.email,
        });
        
        if (authError) throw authError;
      }
      
      // 2. Update user password if provided
      if (userForm.password) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(selectedUser.id, {
          password: userForm.password,
        });
        
        if (passwordError) throw passwordError;
      }
      
      // 3. Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: userForm.first_name,
          last_name: userForm.last_name,
          is_active: userForm.is_active,
        })
        .eq('id', selectedUser.id);
      
      if (profileError) throw profileError;
      
      // 4. Handle admin role
      const isCurrentlyAdmin = selectedUser.roles?.some(r => r.role === 'admin');
      const willBeAdmin = userForm.role === 'admin';
      
      if (isCurrentlyAdmin && !willBeAdmin) {
        // Remove admin role
        const { error: removeRoleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id)
          .eq('role', 'admin');
        
        if (removeRoleError) throw removeRoleError;
      } else if (!isCurrentlyAdmin && willBeAdmin) {
        // Add admin role
        const { error: addRoleError } = await supabase
          .from('user_roles')
          .insert({ user_id: selectedUser.id, role: 'admin' });
        
        if (addRoleError) throw addRoleError;
      }
      
      // 5. Handle company association
      const currentCompanyId = selectedUser.company?.id;
      
      if (currentCompanyId !== userForm.company_id || 
          selectedUser.company_role !== (userForm.is_company_admin ? 'manager' : 'employee')) {
        
        // Remove current company association if exists
        if (currentCompanyId) {
          const { error: removeCompanyError } = await supabase
            .from('company_users')
            .delete()
            .eq('user_id', selectedUser.id)
            .eq('company_id', currentCompanyId);
          
          if (removeCompanyError) throw removeCompanyError;
        }
        
        // Add new company association if selected
        if (userForm.company_id) {
          const { error: addCompanyError } = await supabase
            .from('company_users')
            .insert({
              user_id: selectedUser.id,
              company_id: userForm.company_id,
              role: userForm.role === 'admin' ? 'admin' : (userForm.is_company_admin ? 'manager' : 'employee'),
            });
          
          if (addCompanyError) throw addCompanyError;
        }
      }
      
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase.auth.admin.deleteUser(selectedUser.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      ((user.first_name || '').toLowerCase()).includes(searchLower) ||
      ((user.last_name || '').toLowerCase()).includes(searchLower) ||
      ((user.company?.name || '').toLowerCase()).includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <UserCogIcon className="mr-2" />
          User Management
        </h1>
        <Button onClick={() => handleOpenDialog()} className="bg-primary text-white">
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">No users found</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="h-10 w-10 object-cover" />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center text-gray-500">
                              <UserCogIcon size={20} />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.roles?.some(r => r.role === 'admin') ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Admin
                        </span>
                      ) : user.company_role === 'manager' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Manager
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Employee
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.company?.name || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="mr-1 h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircleIcon className="mr-1 h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(user)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDialog(user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {selectedUser
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
                  onChange={handleInputChange}
                  placeholder="user@example.com"
                  required
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="password">
                  {selectedUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={userForm.password}
                  onChange={handleInputChange}
                  placeholder={selectedUser ? '••••••••' : 'Enter password'}
                  required={!selectedUser}
                />
              </div>
              
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={userForm.first_name}
                  onChange={handleInputChange}
                  placeholder="First name"
                />
              </div>
              
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={userForm.last_name}
                  onChange={handleInputChange}
                  placeholder="Last name"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={userForm.role} 
                  onValueChange={(value) => handleSelectChange('role', value)}
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
                  onValueChange={(value) => handleSelectChange('company_id', value)}
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
                    onCheckedChange={(checked) => handleSwitchChange('is_company_admin', checked)}
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
                  onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                />
                <Label htmlFor="is_active">
                  Active Account
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={selectedUser ? handleUpdateUser : handleCreateUser}
              className="bg-primary text-white"
            >
              {selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.first_name} {selectedUser?.last_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteUser}
              variant="destructive"
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
