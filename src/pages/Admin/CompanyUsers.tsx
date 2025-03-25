
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, UserPlus, Trash2, ArrowLeft, Check, X, UserRoundPlus } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import CreateUserForm from '../../components/users/CreateUserForm';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

// Type definitions for company and user data
interface Company {
  id: string;
  name: string;
}

interface CompanyUser {
  id: string;
  user_id: string;
  company_id: string;
  is_admin: boolean;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    position: string | null;
    phone: string | null;
  };
}

// Interface for available users
interface AvailableUser {
  id: string;
  email: string;
}

const CompanyUsers = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [activeTab, setActiveTab] = useState<string>("existing");

  // Add user form schema
  const addUserSchema = z.object({
    userId: z.string().min(1, "Please select a user"),
    isAdmin: z.boolean().default(false),
  });

  type AddUserFormValues = z.infer<typeof addUserSchema>;

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      userId: "",
      isAdmin: false,
    },
  });

  // Fetch company and its users
  useEffect(() => {
    if (companyId) {
      fetchCompany();
      fetchCompanyUsers();
    }
  }, [companyId]);

  const fetchCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      
      if (error) throw error;
      setCompany(data);
    } catch (error: any) {
      console.error('Error fetching company:', error.message);
      toast({
        title: "Error",
        description: "Could not fetch company details",
        variant: "destructive",
      });
    }
  };

  const fetchCompanyUsers = async () => {
    try {
      setLoading(true);
      
      // Get users from company_users table with profiles
      const { data, error } = await supabase
        .from('company_users')
        .select(`
          *,
          profile:user_id(
            first_name,
            last_name,
            position,
            phone,
            email
          )
        `)
        .eq('company_id', companyId);
      
      if (error) throw error;
      
      // If we have company users, fetch additional user details
      if (data && data.length > 0) {
        setCompanyUsers(data);
        fetchAvailableUsers(data);
      } else {
        setCompanyUsers([]);
        fetchAvailableUsers([]);
      }
    } catch (error: any) {
      console.error('Error fetching company users:', error.message);
      toast({
        title: "Error",
        description: "Could not fetch company users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async (currentUsers: CompanyUser[]) => {
    try {
      // First, get all the user IDs that are already in the company
      const currentUserIds = currentUsers.map(cu => cu.user_id);
      
      // Then fetch users not already in the company
      // We need to query the profiles table which is connected to auth users
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .not('id', 'in', currentUserIds.length > 0 ? `(${currentUserIds.join(',')})` : '(null)');

      if (error) throw error;
      
      // Convert to the format we need
      const availableUsersData = (data || []).map(profile => ({
        id: profile.id,
        email: profile.first_name && profile.last_name 
          ? `${profile.first_name} ${profile.last_name}`
          : `User ${profile.id.substring(0, 8)}`
      }));
      
      setAvailableUsers(availableUsersData);
    } catch (error: any) {
      console.error('Error fetching available users:', error.message);
      toast({
        title: "Error",
        description: "Could not fetch available users",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async (values: AddUserFormValues) => {
    try {
      const { data, error } = await supabase
        .from('company_users')
        .insert({
          company_id: companyId,
          user_id: values.userId,
          is_admin: values.isAdmin,
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "User added to company",
      });
      
      // Refresh the user list
      fetchCompanyUsers();
      setIsAddUserDialogOpen(false);
      form.reset();
    } catch (error: any) {
      console.error('Error adding user to company:', error.message);
      toast({
        title: "Error",
        description: "Could not add user to company",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('company_users')
        .delete()
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      setCompanyUsers(companyUsers.filter(user => user.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      
      toast({
        title: "Success",
        description: "User removed from company",
      });
      
      // Refresh the available users list
      fetchAvailableUsers(companyUsers.filter(user => user.id !== selectedUser.id));
    } catch (error: any) {
      console.error('Error removing user from company:', error.message);
      toast({
        title: "Error",
        description: "Could not remove user from company",
        variant: "destructive",
      });
    }
  };

  const handleCreateUserSuccess = () => {
    setIsCreateUserDialogOpen(false);
    fetchCompanyUsers();
    toast({
      title: "Success",
      description: "New user created and added to company",
    });
  };

  const getUserName = (user: CompanyUser) => {
    if (user.profile && user.profile.first_name && user.profile.last_name) {
      return `${user.profile.first_name} ${user.profile.last_name}`;
    }
    return `User ${user.user_id.substring(0, 8)}`;
  };

  const getUserEmail = (user: CompanyUser) => {
    if (user.profile && user.profile.email) {
      return user.profile.email;
    }
    return '';
  };

  const getUserPosition = (user: CompanyUser) => {
    if (user.profile && user.profile.position) {
      return user.profile.position;
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {company ? `${company.name} - Users` : 'Company Users'}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsAddUserDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Existing User
          </Button>
          <Button onClick={() => setIsCreateUserDialogOpen(true)}>
            <UserRoundPlus className="mr-2 h-4 w-4" />
            Create New User
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <p>Loading users...</p>
        </div>
      ) : companyUsers.length > 0 ? (
        <div className="bg-white rounded-md shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companyUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getUserName(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getUserEmail(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getUserPosition(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.is_admin ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="mr-1 h-3 w-3" />
                        Manager
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <X className="mr-1 h-3 w-3" />
                        Employee
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-md shadow">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a user to this company.
          </p>
          <div className="mt-6 flex space-x-3 justify-center">
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Existing User
            </Button>
            <Button onClick={() => setIsCreateUserDialogOpen(true)}>
              <UserRoundPlus className="mr-2 h-4 w-4" />
              Create New User
            </Button>
          </div>
        </div>
      )}
      
      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to Company</DialogTitle>
            <DialogDescription>
              Add an existing user to this company and set their permissions.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Company Manager
                      </FormLabel>
                      <p className="text-sm text-gray-500">
                        This user will be a manager for this company and will have access to the manager dashboard.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddUserDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add User</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Create User Dialog */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user and add them to this company.
            </DialogDescription>
          </DialogHeader>
          
          {companyId && <CreateUserForm 
            companyId={companyId} 
            onSuccess={handleCreateUserSuccess}
            onCancel={() => setIsCreateUserDialogOpen(false)}
          />}
        </DialogContent>
      </Dialog>
      
      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this user from the company? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CompanyUsers;
