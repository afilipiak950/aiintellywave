
import { useState, useEffect } from 'react';
import { PlusCircle, Search, Trash, Edit, Building, Mail, Phone, User, UserPlus, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Types
type Company = {
  id: string;
  name: string;
  address: string | null;
  logo_url: string | null;
  website: string | null;
  city: string | null;
  country: string | null;
  industry: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  created_at: string;
};

const AdminCustomers = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch companies data from Supabase
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setCompanies(data || []);
    } catch (error: any) {
      console.error('Error fetching companies:', error.message);
      toast({
        title: 'Error fetching companies',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Company form schema
  const companySchema = z.object({
    name: z.string().min(1, 'Company name is required'),
    address: z.string().optional(),
    contact_email: z.string().email('Invalid email address').optional().or(z.literal('')),
    contact_phone: z.string().optional(),
    logo_url: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    industry: z.string().optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
  });

  // Create company form
  const createForm = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      address: '',
      contact_email: '',
      contact_phone: '',
      logo_url: '',
      city: '',
      country: '',
      industry: '',
      website: '',
    },
  });

  // Edit company form
  const editForm = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      address: '',
      contact_email: '',
      contact_phone: '',
      logo_url: '',
      city: '',
      country: '',
      industry: '',
      website: '',
    },
  });

  // Handle company creation
  const handleCreateCompany = async (values: z.infer<typeof companySchema>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([values])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: 'Company created',
        description: `${values.name} has been created successfully.`,
      });

      setIsCreateDialogOpen(false);
      createForm.reset();
      fetchCompanies();
    } catch (error: any) {
      console.error('Error creating company:', error.message);
      toast({
        title: 'Error creating company',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Handle company update
  const handleUpdateCompany = async (values: z.infer<typeof companySchema>) => {
    if (!selectedCompany) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .update(values)
        .eq('id', selectedCompany.id)
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: 'Company updated',
        description: `${values.name} has been updated successfully.`,
      });

      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      fetchCompanies();
    } catch (error: any) {
      console.error('Error updating company:', error.message);
      toast({
        title: 'Error updating company',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Handle company deletion
  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', selectedCompany.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Company deleted',
        description: `${selectedCompany.name} has been deleted.`,
      });

      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
      fetchCompanies();
    } catch (error: any) {
      console.error('Error deleting company:', error.message);
      toast({
        title: 'Error deleting company',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Open edit dialog and populate form
  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    editForm.reset({
      name: company.name,
      address: company.address || '',
      contact_email: company.contact_email || '',
      contact_phone: company.contact_phone || '',
      logo_url: company.logo_url || '',
      city: company.city || '',
      country: company.country || '',
      industry: company.industry || '',
      website: company.website || '',
    });
    setIsEditDialogOpen(true);
  };

  // Filter companies based on search term
  const filteredCompanies = companies.filter(
    (company) => 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.city && company.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.country && company.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search companies..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="whitespace-nowrap">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Company
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogDescription>
                  Add a new company to your customer database
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateCompany)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input placeholder="contact@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="contact_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 123 456 7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={createForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Technology" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="logo_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="Logo image URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="submit">Create Company</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Companies Table */}
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact Info</TableHead>
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
                  <p className="mt-2 text-sm text-gray-500">Loading companies...</p>
                </TableCell>
              </TableRow>
            ) : filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Building className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-1">No companies found</p>
                    <p className="text-sm text-gray-400">
                      {searchTerm ? 'Try adjusting your search term' : 'Start by adding a new company'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        {company.website && (
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                            {company.website.replace(/(^\w+:|^)\/\//, '')}
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.industry || <span className="text-gray-400 text-sm">Not specified</span>}
                  </TableCell>
                  <TableCell>
                    {(company.city || company.country) ? (
                      <span>
                        {company.city}{company.city && company.country && ', '}{company.country}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not specified</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {company.contact_email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-3.5 w-3.5 mr-2 text-gray-500" />
                          <span>{company.contact_email}</span>
                        </div>
                      )}
                      {company.contact_phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3.5 w-3.5 mr-2 text-gray-500" />
                          <span>{company.contact_phone}</span>
                        </div>
                      )}
                      {!company.contact_email && !company.contact_phone && (
                        <span className="text-gray-400 text-sm">No contact info</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(company)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedCompany(company);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update company information
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateCompany)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 123 456 7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Technology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="logo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Logo image URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit">Update Company</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-semibold">{selectedCompany?.name}</span> and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCompany} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCustomers;
