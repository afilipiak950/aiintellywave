
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { Search, RefreshCw, Building, Users, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Customer } from '@/hooks/customers/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const CompaniesCustomersPage = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('companies');
  const [view, setView] = useState<'grid' | 'table'>('table');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching companies and company users data...");
      
      // Fetch all companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (companiesError) {
        throw companiesError;
      }
      
      // Fetch all company users with company details
      const { data: companyUsersData, error: companyUsersError } = await supabase
        .from('company_users')
        .select(`
          id, 
          user_id, 
          company_id, 
          email, 
          full_name, 
          first_name, 
          last_name, 
          role, 
          is_admin,
          avatar_url,
          last_sign_in_at,
          companies(id, name)
        `);
      
      if (companyUsersError) {
        throw companyUsersError;
      }
      
      console.log(`Fetched ${companiesData.length} companies and ${companyUsersData.length} company users`);
      
      setCompanies(companiesData || []);
      setCompanyUsers(companyUsersData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: `Failed to fetch data: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (company.name?.toLowerCase().includes(search)) ||
      (company.description?.toLowerCase().includes(search)) ||
      (company.contact_email?.toLowerCase().includes(search)) ||
      (company.city?.toLowerCase().includes(search)) ||
      (company.country?.toLowerCase().includes(search))
    );
  });
  
  // Filter company users based on search term
  const filteredCompanyUsers = companyUsers.filter(user => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (user.email?.toLowerCase().includes(search)) ||
      (user.full_name?.toLowerCase().includes(search)) ||
      (user.first_name?.toLowerCase().includes(search)) ||
      (user.last_name?.toLowerCase().includes(search)) ||
      (user.role?.toLowerCase().includes(search)) ||
      (user.companies?.name?.toLowerCase().includes(search))
    );
  });

  // Get company name for a user
  const getCompanyName = (user: any) => {
    if (user.companies && user.companies.name) {
      return user.companies.name;
    }
    
    const company = companies.find(c => c.id === user.company_id);
    return company ? company.name : 'Unknown Company';
  };

  // Loading skeleton for companies
  const CompaniesLoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Loading skeleton for customers table
  const CustomersLoadingSkeleton = () => (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-slate-50 p-3 border-b">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32 ml-auto" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render companies grid view
  const renderCompaniesGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCompanies.map(company => (
        <Card key={company.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {company.name || 'Unnamed Company'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company.description && (
              <p className="text-sm text-muted-foreground mb-2">{company.description}</p>
            )}
            <div className="space-y-1 text-sm">
              {company.contact_email && (
                <p><span className="font-medium">Email:</span> {company.contact_email}</p>
              )}
              {company.contact_phone && (
                <p><span className="font-medium">Phone:</span> {company.contact_phone}</p>
              )}
              {(company.city || company.country) && (
                <p><span className="font-medium">Location:</span> {[company.city, company.country].filter(Boolean).join(', ')}</p>
              )}
            </div>
            
            {/* Company users count */}
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {companyUsers.filter(u => u.company_id === company.id).length} Users
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render companies table view
  const renderCompaniesTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Users</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCompanies.map(company => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.name || 'Unnamed Company'}</TableCell>
              <TableCell>
                <div>
                  {company.contact_email && (
                    <div className="text-sm">{company.contact_email}</div>
                  )}
                  {company.contact_phone && (
                    <div className="text-xs text-muted-foreground">{company.contact_phone}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {[company.city, company.country].filter(Boolean).join(', ') || '-'}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                  <Users className="h-3 w-3" />
                  {companyUsers.filter(u => u.company_id === company.id).length}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Render customers table view
  const renderCustomersTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Company</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCompanyUsers.map(user => (
            <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-medium">
                {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User'}
              </TableCell>
              <TableCell>{user.email || '-'}</TableCell>
              <TableCell>
                <Badge 
                  variant={user.is_admin ? "default" : "outline"}
                  className="capitalize"
                >
                  {user.role || 'customer'}
                </Badge>
              </TableCell>
              <TableCell>{getCompanyName(user)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Render customers grid view
  const renderCustomersGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCompanyUsers.map(user => (
        <Card key={user.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {user.first_name ? user.first_name[0] : user.email ? user.email[0] : 'U'}
              </div>
              <div>
                {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User'}
                <div className="text-xs font-normal text-muted-foreground mt-1">
                  {user.email}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Role:</span>
                <Badge 
                  variant={user.is_admin ? "default" : "outline"}
                  className="capitalize"
                >
                  {user.role || 'customer'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Company:</span>
                <span>{getCompanyName(user)}</span>
              </div>
              {user.last_sign_in_at && (
                <div className="flex justify-between">
                  <span className="font-medium">Last Sign In:</span>
                  <span>
                    {new Date(user.last_sign_in_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  const renderActiveTabContent = () => {
    if (loading) {
      return activeTab === 'companies' ? 
        <CompaniesLoadingSkeleton /> : 
        <CustomersLoadingSkeleton />;
    }
    
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-6">
          <h3 className="text-red-800 font-medium">Error Loading Data</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <Button 
            onClick={fetchData} 
            variant="destructive"
            size="sm" 
            className="mt-3"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }
    
    if (activeTab === 'companies') {
      if (filteredCompanies.length === 0) {
        return (
          <div className="text-center py-10 border rounded-md">
            <Building className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium mt-3">No Companies Found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {searchTerm ? 'No companies match your search criteria' : 'Try adding a company'}
            </p>
          </div>
        );
      }
      
      return view === 'grid' ? renderCompaniesGrid() : renderCompaniesTable();
    } else {
      if (filteredCompanyUsers.length === 0) {
        return (
          <div className="text-center py-10 border rounded-md">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium mt-3">No Customers Found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {searchTerm ? 'No customers match your search criteria' : 'Try adding a customer'}
            </p>
          </div>
        );
      }
      
      return view === 'grid' ? renderCustomersGrid() : renderCustomersTable();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Companies & Customers</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="companies" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building className="h-4 w-4" /> 
              Companies ({companies.length})
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> 
              Customers ({companyUsers.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('table')}
              className="h-8"
            >
              Table
            </Button>
            <Button
              variant={view === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('grid')}
              className="h-8"
            >
              Grid
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          {renderActiveTabContent()}
        </div>
      </Tabs>
    </div>
  );
};

export default CompaniesCustomersPage;
