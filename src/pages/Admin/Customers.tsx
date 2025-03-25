
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit, Trash2, Building2, Users } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface Company {
  id: string;
  name: string;
  address?: string;
  website?: string;
  industry?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().optional(),
  contact_email: z.string().email("Invalid email").optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  logo_url: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal('')),
  city: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Customers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      contact_email: "",
      contact_phone: "",
      logo_url: "",
      website: "",
      city: "",
      country: "",
      industry: "",
    },
  });
  
  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      contact_email: "",
      contact_phone: "",
      logo_url: "",
      website: "",
      city: "",
      country: "",
      industry: "",
    },
  });
  
  useEffect(() => {
    fetchCompanies();
  }, []);
  
  useEffect(() => {
    if (selectedCompany && isEditDialogOpen) {
      editForm.reset({
        name: selectedCompany.name || "",
        address: selectedCompany.address || "",
        contact_email: selectedCompany.contact_email || "",
        contact_phone: selectedCompany.contact_phone || "",
        logo_url: selectedCompany.logo_url || "",
        website: selectedCompany.website || "",
        city: selectedCompany.city || "",
        country: selectedCompany.country || "",
        industry: selectedCompany.industry || "",
      });
    }
  }, [selectedCompany, isEditDialogOpen, editForm]);
  
  const fetchCompanies = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateCompany = async (values: FormValues) => {
    try {
      // Ensure name is always provided - this should be guaranteed by Zod validation
      // but we'll double-check it here as well
      if (!values.name || values.name.trim() === '') {
        form.setError("name", {
          type: "manual",
          message: "Name is required",
        });
        return;
      }
      
      // The values object from the form will have the correct type with name as required
      // because of our zod schema validation
      const { data, error } = await supabase
        .from('companies')
        .insert(values)
        .select();
      
      if (error) {
        console.error('Error creating company:', error);
        throw error;
      }
      
      setCompanies([...companies, data[0]]);
      setIsCreateDialogOpen(false);
      form.reset();
      
      toast({
        title: "Success",
        description: "Company created successfully",
      });
    } catch (error: any) {
      console.error('Error creating company:', error.message);
      toast({
        title: "Error",
        description: "Could not create company",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateCompany = async (values: FormValues) => {
    if (!selectedCompany) return;
    
    try {
      // Ensure name is provided
      if (!values.name || values.name.trim() === '') {
        editForm.setError("name", {
          type: "manual",
          message: "Name is required",
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('companies')
        .update(values)
        .eq('id', selectedCompany.id)
        .select();
      
      if (error) throw error;
      
      setCompanies(companies.map(company => 
        company.id === selectedCompany.id ? data[0] : company
      ));
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating company:', error.message);
      toast({
        title: "Error",
        description: "Could not update company",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;
    
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', selectedCompany.id);
      
      if (error) throw error;
      
      setCompanies(companies.filter(company => company.id !== selectedCompany.id));
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
      
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting company:', error.message);
      toast({
        title: "Error",
        description: "Could not delete company",
        variant: "destructive",
      });
    }
  };
  
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (company.city && company.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (company.country && company.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Companies</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>
      
      <div className="flex justify-between items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search companies..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <p>Loading companies...</p>
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{company.name}</h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedCompany(company);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setSelectedCompany(company);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {company.industry && (
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Industry:</span> {company.industry}
                  </p>
                )}
                
                {company.address && (
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Address:</span> {company.address}
                    {company.city && company.country && (
                      <>, {company.city}, {company.country}</>
                    )}
                    {company.city && !company.country && (
                      <>, {company.city}</>
                    )}
                    {!company.city && company.country && (
                      <>, {company.country}</>
                    )}
                  </p>
                )}
                
                {company.contact_email && (
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Email:</span> {company.contact_email}
                  </p>
                )}
                
                {company.contact_phone && (
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Phone:</span> {company.contact_phone}
                  </p>
                )}
                
                {company.website && (
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Website:</span>{" "}
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  </p>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/company/${company.id}/users`)}
                  >
                    <Users className="mr-1 h-4 w-4" />
                    Users
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery 
              ? "No companies match your search criteria." 
              : "Get started by adding a company."}
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </div>
        </div>
      )}
      
      {/* Create Company Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Company</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateCompany)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="Industry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Website" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
              </div>
              
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
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Company Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateCompany)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
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
                      <Input placeholder="Industry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
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
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Website" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedCompany(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Company Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this company? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCompany(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCompany}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Customers;
