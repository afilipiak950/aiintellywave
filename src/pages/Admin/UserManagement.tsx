
import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { PlusCircleIcon, UserCogIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import UserTable from '@/components/admin/UserTable';
import UserForm from '@/components/admin/UserForm';
import UserDeleteConfirmation from '@/components/admin/UserDeleteConfirmation';
import { User } from '@/types/user';

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
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

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      const { data: companyUsers, error: companyError } = await supabase
        .from('company_users')
        .select('user_id, company_id, role, companies:company_id(id, name)');
      
      if (companyError) throw companyError;
      
      const mergedUsers = authUsers.users.map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id) || {};
        const roles = userRoles?.filter(r => r.user_id === authUser.id) || [];
        const companyUser = companyUsers?.find(cu => cu.user_id === authUser.id);
        
        return {
          id: authUser.id,
          email: authUser.email || '',
          first_name: profile && 'first_name' in profile ? profile.first_name : null,
          last_name: profile && 'last_name' in profile ? profile.last_name : null,
          is_active: profile && 'is_active' in profile ? profile.is_active : true,
          avatar_url: profile && 'avatar_url' in profile ? profile.avatar_url : null,
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

  const handleOpenFormDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setUserForm({
        email: user.email || '',
        password: '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_active: user.is_active !== false,
        company_id: user.company?.id || '',
        is_company_admin: user.company_role === 'manager',
        role: user.roles?.some(r => r.role === 'admin') ? 'admin' : 
              user.company_role === 'manager' ? 'manager' : 'employee',
      });
    } else {
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
    setIsFormDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
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
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userForm.email,
        password: userForm.password,
        email_confirm: true,
      });
      
      if (authError) throw authError;
      
      const userId = authData.user.id;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: userForm.first_name,
          last_name: userForm.last_name,
          is_active: userForm.is_active,
        })
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      if (userForm.role === 'admin') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        
        if (roleError) throw roleError;
      }
      
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
      
      setIsFormDialogOpen(false);
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
      if (selectedUser.email !== userForm.email) {
        const { error: authError } = await supabase.auth.admin.updateUserById(selectedUser.id, {
          email: userForm.email,
        });
        
        if (authError) throw authError;
      }
      
      if (userForm.password) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(selectedUser.id, {
          password: userForm.password,
        });
        
        if (passwordError) throw passwordError;
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: userForm.first_name,
          last_name: userForm.last_name,
          is_active: userForm.is_active,
        })
        .eq('id', selectedUser.id);
      
      if (profileError) throw profileError;
      
      const isCurrentlyAdmin = selectedUser.roles?.some(r => r.role === 'admin');
      const willBeAdmin = userForm.role === 'admin';
      
      if (isCurrentlyAdmin && !willBeAdmin) {
        const { error: removeRoleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id)
          .eq('role', 'admin');
        
        if (removeRoleError) throw removeRoleError;
      } else if (!isCurrentlyAdmin && willBeAdmin) {
        const { error: addRoleError } = await supabase
          .from('user_roles')
          .insert({ user_id: selectedUser.id, role: 'admin' });
        
        if (addRoleError) throw addRoleError;
      }
      
      const currentCompanyId = selectedUser.company?.id;
      
      if (currentCompanyId !== userForm.company_id || 
          selectedUser.company_role !== (userForm.is_company_admin ? 'manager' : 'employee')) {
        
        if (currentCompanyId) {
          const { error: removeCompanyError } = await supabase
            .from('company_users')
            .delete()
            .eq('user_id', selectedUser.id)
            .eq('company_id', currentCompanyId);
          
          if (removeCompanyError) throw removeCompanyError;
        }
        
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
      
      setIsFormDialogOpen(false);
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <UserCogIcon className="mr-2" />
          User Management
        </h1>
        <Button onClick={() => handleOpenFormDialog()} className="bg-primary text-white">
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

      <UserTable
        users={users}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onEditUser={handleOpenFormDialog}
        onDeleteUser={handleOpenDeleteDialog}
      />

      <UserForm
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        userForm={userForm}
        isEditing={!!selectedUser}
        companies={companies}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onSwitchChange={handleSwitchChange}
        onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
      />

      <UserDeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        user={selectedUser}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
};

export default UserManagement;
