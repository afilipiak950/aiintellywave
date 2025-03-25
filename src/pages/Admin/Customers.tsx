
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Search, UserPlus, Filter, ArrowDownUp, X } from 'lucide-react';
import { toast } from "../../hooks/use-toast";
import CustomerCard from '../../components/ui/customer/CustomerCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'inactive';
  projects: number;
}

interface Company {
  id: string;
  name: string;
}

// Form schema for adding a user
const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "manager", "customer"], {
    required_error: "Please select a role",
  }),
  companyId: z.string().min(1, "Please select a company"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const AdminCustomers = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  // Create form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      role: "customer",
      companyId: "",
    },
  });
  
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        
        // Fetch all companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name');
          
        if (companiesError) {
          console.error('Error fetching companies:', companiesError);
          throw companiesError;
        }
          
        if (companiesData) {
          setCompanies(companiesData);
        }
        
        // Get all company users with role 'customer'
        const { data: companyUsers, error: companyUsersError } = await supabase
          .from('company_users')
          .select(`
            id,
            user_id,
            role,
            companies:company_id(id, name)
          `)
          .eq('role', 'customer');
          
        if (companyUsersError) {
          console.error('Error fetching company users:', companyUsersError);
          throw companyUsersError;
        }
          
        if (companyUsers && companyUsers.length > 0) {
          console.log('Found company users:', companyUsers);
          
          // Get profiles separately
          const userIds = companyUsers.map(cu => cu.user_id);
          
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url, phone, is_active');
            
          if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            throw profilesError;
          }
          
          // Create a map for easy lookup
          const profilesMap = new Map();
          if (profilesData) {
            profilesData.forEach(profile => {
              profilesMap.set(profile.id, profile);
            });
          }
          
          // Try to get the auth emails (may not be directly accessible)
          // Using getUser() can be an admin-only operation
          const userEmails = new Map();
          
          // Fallback for missing emails - get the auth users if we have permission
          try {
            const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
            if (!authError && authData) {
              authData.users.forEach(user => {
                userEmails.set(user.id, user.email);
              });
            }
          } catch (err) {
            console.warn('Could not access auth users list (requires admin permissions):', err);
          }
          
          // Transform data
          const transformedCustomers = companyUsers.map(cu => {
            const profile = profilesMap.get(cu.user_id) || {};
            const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed User';
            const isActive = profile.is_active === true;
            
            // Try to get email from fallback
            const email = userEmails.get(cu.user_id) || `user${cu.user_id.substring(0, 4)}@example.com`;
            
            return {
              id: cu.id,
              name,
              company: cu.companies?.name || 'No Company',
              email: email,
              phone: profile.phone || 'N/A',
              avatar: profile.avatar_url,
              status: isActive ? 'active' as const : 'inactive' as const,
              projects: 0 // We'll count this separately
            };
          });
          
          // Count projects for each customer
          const finalCustomers = await Promise.all(
            transformedCustomers.map(async (customer) => {
              try {
                const { count, error } = await supabase
                  .from('projects')
                  .select('*', { count: 'exact', head: true })
                  .eq('company_id', customer.company);
                  
                if (!error && count !== null) {
                  customer.projects = count;
                }
              } catch (err) {
                console.warn(`Error counting projects for customer ${customer.id}:`, err);
              }
              
              return customer;
            })
          );
          
          setCustomers(finalCustomers);
          console.log('Transformed customers:', finalCustomers);
        } else {
          console.log('No company users found with role customer');
          setCustomers([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load customers data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);
  
  // Filter and search customers
  const filteredCustomers = customers
    .filter(customer => 
      filter === 'all' || 
      (filter === 'active' && customer.status === 'active') ||
      (filter === 'inactive' && customer.status === 'inactive')
    )
    .filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  const handleAddUser = async (data: UserFormValues) => {
    try {
      setLoading(true);
      
      // Step 1: Create the user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Step 2: Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
          })
          .eq('id', authData.user.id);
          
        if (profileError) throw profileError;
        
        // Step 3: Add company_user relationship with role
        const { error: companyUserError } = await supabase
          .from('company_users')
          .insert({
            user_id: authData.user.id,
            company_id: data.companyId,
            role: data.role,
          });
          
        if (companyUserError) throw companyUserError;
        
        toast({
          title: "Success",
          description: "User created successfully.",
        });
        
        // Refresh the customers list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsAddingUser(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button 
          onClick={() => setIsAddingUser(true)}
          className="btn-primary inline-flex sm:self-end"
        >
          <UserPlus size={18} className="mr-2" />
          Add User
        </button>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-4">
          <div className="relative inline-block">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Filter size={16} className="mr-2" />
              Filter
            </button>
          </div>
          
          <div className="relative inline-block">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <ArrowDownUp size={16} className="mr-2" />
              Sort
            </button>
          </div>
        </div>
      </div>
      
      {/* Filter Pills */}
      <div className="flex items-center space-x-2">
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'inactive'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('inactive')}
        >
          Inactive
        </button>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Customer Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.length > 0 ? (
            customers
              .filter(customer => 
                filter === 'all' || 
                (filter === 'active' && customer.status === 'active') ||
                (filter === 'inactive' && customer.status === 'inactive')
              )
              .filter(customer => 
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((customer) => (
                <CustomerCard 
                  key={customer.id} 
                  customer={customer} 
                  onClick={() => console.log('Customer clicked:', customer.id)} 
                />
              ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">No customers found. Try adding some customers first.</p>
            </div>
          )}
        </div>
      )}
      
      {/* No Results */}
      {!loading && customers.length > 0 && filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">
            We couldn't find any customers matching your search criteria. Try adjusting your filters.
          </p>
        </div>
      )}
      
      {/* User creation dialog */}
      <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              onClick={() => setIsAddingUser(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>
            
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
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
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
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
              </div>
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddingUser(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
