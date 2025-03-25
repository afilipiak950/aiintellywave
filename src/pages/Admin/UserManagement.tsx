
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Shield, 
  Building2,
  UserCog,
  CheckCircle2,
  XCircle
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  role?: string;
  company_id?: string;
  company_name?: string;
}

interface Company {
  id: string;
  name: string;
}

interface CompanyUser {
  id: string;
  user_id: string;
  company_id: string;
  role: 'admin' | 'manager' | 'employee';
  created_at: string;
}

const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  company_id: z.string().uuid("Please select a company"),
  role: z.enum(["admin", "manager", "employee"], {
    required_error: "Please select a role",
  }),
  is_active: z.boolean().default(true),
});

type UserFormValues = z.infer<typeof userSchema>;

const UserManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      company_id: "",
      role: "employee",
      is_active: true,
    },
  });
  
  const editForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema.omit({ password: true }).extend({
      password: z.string().min(6, "Password must be at least 6 characters").optional(),
    })),
    defaultValues: {
      email: "",
      full_name: "",
      company_id: "",
      role: "employee",
      is_active: true,
    },
  });
  
  useEffect(() => {
    fetchCompanies();
    fetchUsers();
  }, []);
  
  useEffect(() => {
    if (selectedUser && isEditDialogOpen) {
      editForm.reset({
        email: selectedUser.email,
        full_name: selectedUser.full_name || "",
        company_id: selectedUser.company_id || "",
        role: selectedUser.role as "admin" | "manager" | "employee" || "employee",
        is_active: selectedUser.is_active,
      });
    }
  }, [selectedUser, isEditDialogOpen, editForm]);
  
  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      console.error('Error fetching companies:', error.message);
      toast({
        title: "Error",
        description: "Could not fetch companies",
        variant: "destructive",
      });
    }
  };
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Get all company_users
      const { data: companyUsersData, error: companyUsersError } = await supabase
        .from('company_users')
        .select('*, companies(id, name)');
      
      if (companyUsersError) throw companyUsersError;
      
      // Get auth users for email
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      // Map profiles with company and role data
      const usersWithDetails = profilesData.map((profile: any) => {
        const companyUser = companyUsersData.find((cu: any) => cu.user_id === profile.id);
        const authUser = authData?.users.find((user: any) => user.id === profile.id);
        
        return {
          id: profile.id,
          email: authUser?.email || "",
          full_name: profile.full_name,
          is_active: profile.is_active,
          role: companyUser?.role || "",
          company_id: companyUser?.company_id || "",
          company_name: companyUser?.companies?.name || "",
        };
      });
      
      setUsers(usersWithDetails);
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      toast({
        title: "Error",
        description: "Could not fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateUser = async (values: UserFormValues) => {
    try {
      setLoading(true);
      
      // 1. Create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: values.email,
        password: values.password || generateRandomPassword(),
        email_confirm: true,
      });
      
      if (authError) throw authError;
      
      const userId = authData.user.id;
      
      // 2. Update the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          is_active: values.is_active,
        })
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      // 3. Create company_user association
      const { error: companyUserError } = await supabase
        .from('company_users')
        .insert({
          user_id: userId,
          company_id: values.company_id,
          role: values.role,
        });
      
      if (companyUserError) throw companyUserError;
      
      // 4. Create user role if it's an admin
      if (values.role === 'admin') {
        const { error: userRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'admin',
          });
        
        if (userRoleError) throw userRoleError;
      }
      
      await fetchUsers();
      setIsCreateDialogOpen(false);
      form.reset();
      
      toast({
        title: "Success",
        description: "User created successfully",
      });
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      toast({
        title: "Error",
        description: error.message || "Could not create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateUser = async (values: UserFormValues) => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      
      // 1. Update auth user if password is provided
      if (values.password && values.password.trim() !== '') {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          selectedUser.id,
          { password: values.password }
        );
        
        if (authError) throw authError;
      }
      
      // 2. Update the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          is_active: values.is_active,
        })
        .eq('id', selectedUser.id);
      
      if (profileError) throw profileError;
      
      // 3. Update or create company_user association
      const { data: existingCompanyUser, error: fetchError } = await supabase
        .from('company_users')
        .select('*')
        .eq('user_id', selectedUser.id)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (existingCompanyUser) {
        const { error: updateError } = await supabase
          .from('company_users')
          .update({
            company_id: values.company_id,
            role: values.role,
          })
          .eq('id', existingCompanyUser.id);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('company_users')
          .insert({
            user_id: selectedUser.id,
            company_id: values.company_id,
            role: values.role,
          });
        
        if (insertError) throw insertError;
      }
      
      // 4. Handle admin role
      if (values.role === 'admin') {
        // Check if user already has admin role
        const { data: existingRole, error: roleCheckError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', selectedUser.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (roleCheckError) throw roleCheckError;
        
        // Add admin role if it doesn't exist
        if (!existingRole) {
          const { error: insertRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: selectedUser.id,
              role: 'admin',
            });
          
          if (insertRoleError) throw insertRoleError;
        }
      } else {
        // Remove admin role if it exists
        const { error: deleteRoleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id)
          .eq('role', 'admin');
        
        if (deleteRoleError) throw deleteRoleError;
      }
      
      await fetchUsers();
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating user:', error.message);
      toast({
        title: "Error",
        description: error.message || "Could not update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      
      // Delete the user from auth (this will cascade delete related records)
      const { error } = await supabase.auth.admin.deleteUser(selectedUser.id);
      
      if (error) throw error;
      
      // Remove from local state
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error.message);
      toast({
        title: "Error",
        description: error.message || "Could not delete user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to generate a random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  
  // Filter users based on search and other filters
  const filteredUsers = users.filter(user => {
    // Text search (name, email)
    const matchesSearch = 
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Company filter
    const matchesCompany = companyFilter === 'all' || user.company_id === companyFilter;
    
    // Role filter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesCompany && matchesRole;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || '—'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.company_name || '—'}</TableCell>
                    <TableCell>
                      {user.role === 'admin' && (
                        <Badge variant="default" className="bg-purple-500">
                          <Shield className="mr-1 h-3 w-3" />
                          Admin
                        </Badge>
                      )}
                      {user.role === 'manager' && (
                        <Badge variant="default" className="bg-blue-500">
                          <UserCog className="mr-1 h-3 w-3" />
                          Manager
                        </Badge>
                      )}
                      {user.role === 'employee' && (
                        <Badge variant="default" className="bg-green-500">
                          <User className="mr-1 h-3 w-3" />
                          Employee
                        </Badge>
                      )}
                      {!user.role && '—'}
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <XCircle className="mr-1 h-3 w-3" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || companyFilter !== 'all' || roleFilter !== 'all'
              ? "No users match your search criteria."
              : "Get started by adding a user."}
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
      )}
      
      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Leave blank for random password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        User can log in and access the system
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateUser)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Leave blank to keep current password" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        User can log in and access the system
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
