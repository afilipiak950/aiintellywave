
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Building2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompanyUsersList from '@/components/ui/customer/CompanyUsersList';
import CompanyEditDialog from '@/components/ui/company/CompanyEditDialog';
import { toast } from '@/hooks/use-toast';
import { fetchCompanyById } from '@/services/companyService';
import { fetchCompanyUsers } from '@/services/companyUserService';
import { CompanyData, UserData } from '@/services/types/customerTypes';

const CompanyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [usersByCompany, setUsersByCompany] = useState<Record<string, UserData[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchCompanyData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch company details
      const companyData = await fetchCompanyById(id);
      setCompany(companyData);
      
      // Fetch company users
      const companyUsersData = await fetchCompanyUsers();
      setUsersByCompany(companyUsersData);
      
    } catch (err: any) {
      console.error('Error fetching company details:', err);
      setError(err.message || 'Failed to load company details');
      toast({
        title: 'Error',
        description: 'Failed to load company details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCompanyUpdated = () => {
    toast({
      title: 'Success',
      description: 'Company information updated successfully',
    });
    fetchCompanyData();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={handleBack} className="mr-4">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Company Details</h1>
        </div>
        
        {company && (
          <Button 
            onClick={() => setIsEditDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Edit size={16} className="mr-1" />
            Edit Company
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : error ? (
        <Card className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Error Loading Company</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleBack} variant="outline">
              Go Back
            </Button>
            <Button onClick={fetchCompanyData}>
              Try Again
            </Button>
          </div>
        </Card>
      ) : company ? (
        <>
          {/* Company Overview */}
          <Card className="mb-8">
            <div className="p-6 border-b">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Building2 size={24} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{company.name}</h2>
                  {company.industry && <p className="text-gray-500">{company.industry}</p>}
                </div>
              </div>
              
              {company.description && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                  <p className="text-gray-600">{company.description}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {company.contact_email && (
                    <div className="flex">
                      <span className="w-24 text-gray-500">Email:</span>
                      <a href={`mailto:${company.contact_email}`} className="text-blue-600 hover:underline">
                        {company.contact_email}
                      </a>
                    </div>
                  )}
                  
                  {company.contact_phone && (
                    <div className="flex">
                      <span className="w-24 text-gray-500">Phone:</span>
                      <span>{company.contact_phone}</span>
                    </div>
                  )}
                  
                  {company.website && (
                    <div className="flex">
                      <span className="w-24 text-gray-500">Website:</span>
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Address</h3>
                <div className="space-y-2">
                  {company.address && (
                    <div className="flex">
                      <span className="w-24 text-gray-500">Street:</span>
                      <span>{company.address}</span>
                    </div>
                  )}
                  
                  {(company.city || company.postal_code) && (
                    <div className="flex">
                      <span className="w-24 text-gray-500">City/ZIP:</span>
                      <span>
                        {[company.city, company.postal_code].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  
                  {company.country && (
                    <div className="flex">
                      <span className="w-24 text-gray-500">Country:</span>
                      <span>{company.country}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
          
          {/* Tabs for Users, Projects, etc. */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="users">Company Users</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-0">
              <CompanyUsersList 
                companies={company ? [company] : []} 
                usersByCompany={usersByCompany} 
                onCompanyUpdated={handleCompanyUpdated}
              />
            </TabsContent>
            
            <TabsContent value="projects" className="mt-0">
              <Card className="p-6 text-center">
                <p className="text-gray-500">Project management will be implemented in future updates.</p>
              </Card>
            </TabsContent>
            
            <TabsContent value="statistics" className="mt-0">
              <Card className="p-6 text-center">
                <p className="text-gray-500">Company statistics will be implemented in future updates.</p>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Edit Company Dialog */}
          <CompanyEditDialog 
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            company={company}
            onCompanyUpdated={handleCompanyUpdated}
          />
        </>
      ) : (
        <Card className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Company Not Found</h3>
          <p className="text-gray-600 mb-4">The requested company could not be found.</p>
          <Button onClick={handleBack}>
            Go Back
          </Button>
        </Card>
      )}
    </div>
  );
};

export default CompanyDetail;
