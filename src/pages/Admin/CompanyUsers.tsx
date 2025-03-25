
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, UserPlus, Users, ArrowLeft, Trash, Edit, Mail, Shield, ShieldAlert, ShieldCheck, 
  Building, MoreVertical, UserCog, UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
type Company = {
  id: string;
  name: string;
  logo_url: string | null;
};

type CompanyUser = {
  id: string;
  user_id: string;
  company_id: string;
  is_admin: boolean;
  created_at: string;
  user: {
    email: string;
    role: string;
    profile: {
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    } | null;
  };
};

const CompanyUsers = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null);
  const [availableUsers, setAvailableUsers] = useState<Array<{id: string, email: string}>>([]);

  // Add user form schema
  const addUserSchema = z.object({
    user_id: z.string().min(1, 'User is required'),
    is_admin: z.boolean().default(false),
  });

  // Add user form
  const addUserForm = useForm<z.infer<typeof addUserSchema>>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      user_id: '',
      is_admin: false,
    },
  });

  // Fetch company details
  const fetchCompany = async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, logo_url')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      setCompany(data);
    } catch (error: any) {
      console.error('Error fetching company:', error.message);
      toast({
        title: 'Error',
        description: 'Could not load company details',
        variant: 'destructive',
      });
      navigate('/admin/customers');
    }
  };

  // Fetch company users
  const fetchCompanyUsers = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_users')
        .select(`
          id,
          user_id,
          company_id,
          is_admin,
          created_at,
          user:user_id (
            email,
            role:user_roles (role),
            profile:profiles (
              first_name,
              last_name,
              avatar_url
            )
          )
        `)
        .eq('company_id', companyId);

      if (error) throw error;
      setCompanyUsers(data as CompanyUsers[]);
    } catch (error: any) {
      console.error('Error fetching company users:', error.message);
      toast({
        title: 'Error',
        description: 'Could not load company users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available users (not already in the company)
  const fetchAvailableUsers = async () => {
    try {
      // First get current user IDs
      const currentUserIds = companyUsers.map(cu => cu.user_id);
      
      // Then fetch users not already in the company
      const { data, error } = await supabase
        .from('auth.users')
        .select('id, email')
        .not('id', 'in', currentUserIds.length > 0 ? `(${currentUserIds.join(',')})` : '(null)');

      if (error) throw error;
      setAvailableUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching available users:', error.message);
      toast({
        title: 'Error',
        description: 'Could not load available users',
        variant: 'destructive',
      });
    }
  };

  // Toggle user admin status
  const toggleAdminStatus = async (user: CompanyUser) => {
    try {
      const { error } = await supabase
        .from('company_users')
        .update({ is_admin: !user.is_admin })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'User updated',
        description: `User ${user.is_admin ? 'removed from' : 'added as'} company admin`,
      });
      
      fetchCompanyUsers();
    } catch (error: any) {
      console.error('Error updating user:', error.message);
      toast({
        title: 'Error',
        description: 'Could not update user role',
        variant: 'destructive',
      });
    }
  };

  // Add user to company
  const handleAddUser = async (values: z.infer<typeof addUserSchema>) => {
    try {
      const { error } = await supabase
        .from('company_users')
        .insert([
          {
            company_id: companyId,
            user_id: values.user_id,
            is_admin: values.is_admin,
          },
        ]);

      if (error) throw error;

      toast({
        title: 'User added',
        description: 'User has been added to the company',
      });

      setIsAddUserDialogOpen(false);
      addUserForm.reset();
      fetchCompanyUsers();
    } catch (error: any) {
      console.error('Error adding user:', error.message);
      toast({
        title: 'Error',
        description: 'Could not add user to company',
        variant: 'destructive',
      });
    }
  };

  // Remove user from company
  const handleRemoveUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('company_users')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: 'User removed',
        description: 'User has been removed from the company',
      });

      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchCompanyUsers();
    } catch (error: any) {
      console.error('Error removing user:', error.message);
      toast({
        title: 'Error',
        description: 'Could not remove user from company',
        variant: 'destructive',
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (companyId) {
      fetchCompany();
      fetchCompanyUsers();
    }
  }, [companyId]);

  // Load available users when dialog opens
  useEffect(() => {
    if (isAddUserDialogOpen) {
      fetchAvailableUsers();
    }
  }, [isAddUserDialogOpen, companyUsers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/admin/customers')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
          <h1 className="text-2xl font-bold">
            {company ? company.name : 'Company'} - Users
          </h1>
        </div>
        
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User to Company</DialogTitle>
              <DialogDescription>
                Add an existing user to {company?.name || 'this company'}
              </DialogDescription>
            </DialogHeader>
            <Form {...addUserForm}>
              <form onSubmit={addUserForm.handleSubmit(handleAddUser)} className="space-y-4">
                <FormField
                  control={addUserForm.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select User</FormLabel>
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
                          {availableUsers.length === 0 ? (
                            <SelectItem value="no-users" disabled>
                              No available users
                            </SelectItem>
                          ) : (
                            availableUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.email}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select an existing user to add to this company
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addUserForm.control}
                  name="is_admin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Company Admin</FormLabel>
                        <FormDescription>
                          Company admins can manage users and projects
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit">Add User</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Company Users
          </CardTitle>
          <CardDescription>
            Manage users associated with {company?.name || 'this company'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                  </TableCell>
                </TableRow>
              ) : companyUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-gray-500 mb-1">No users found</p>
                      <p className="text-sm text-gray-400">
                        Add users to this company
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                companyUsers.map((companyUser) => (
                  <TableRow key={companyUser.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {companyUser.user?.profile?.avatar_url ? (
                            <img 
                              src={companyUser.user.profile.avatar_url} 
                              alt={`${companyUser.user.profile.first_name || ''} ${companyUser.user.profile.last_name || ''}`}
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <User className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {companyUser.user?.profile?.first_name || ''} {companyUser.user?.profile?.last_name || 'Unnamed User'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        {companyUser.user?.email || 'No email'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {companyUser.is_admin ? (
                          <>
                            <ShieldCheck className="h-4 w-4 text-amber-500" />
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-medium">
                              Company Admin
                            </span>
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium">
                              Member
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleAdminStatus(companyUser)}>
                            {companyUser.is_admin ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Remove admin role
                              </>
                            ) : (
                              <>
                                <UserCog className="h-4 w-4 mr-2" />
                                Make admin
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedUser(companyUser);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Remove from company
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove user from company?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <span className="font-semibold">{selectedUser?.user.email}</span> from {company?.name}.
              They will lose access to all company data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveUser} className="bg-destructive hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CompanyUsers;
