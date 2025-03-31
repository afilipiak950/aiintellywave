
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { Building, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompaniesCustomersData } from '@/hooks/companies-customers/useCompaniesCustomersData';

// Import our new components
import PageHeader from '@/components/admin/companies-customers/PageHeader';
import ViewToggle from '@/components/admin/companies-customers/ViewToggle';
import { CompaniesLoadingSkeleton, CustomersLoadingSkeleton } from '@/components/admin/companies-customers/LoadingSkeletons';
import ErrorState from '@/components/admin/companies-customers/ErrorState';
import EmptyState from '@/components/admin/companies-customers/EmptyState';
import CompaniesGridView from '@/components/admin/companies-customers/CompaniesGridView';
import CompaniesTableView from '@/components/admin/companies-customers/CompaniesTableView';
import CustomersGridView from '@/components/admin/companies-customers/CustomersGridView';
import CustomersTableView from '@/components/admin/companies-customers/CustomersTableView';

const CompaniesCustomersPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('companies');
  const [view, setView] = useState<'grid' | 'table'>('table');
  
  const {
    companies,
    companyUsers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    fetchData,
    getCompanyName,
    getUserCount,
    totalCompanies,
    totalUsers
  } = useCompaniesCustomersData();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const getSearchPlaceholder = () => {
    return activeTab === 'companies' ? 'Search companies...' : 'Search customers...';
  };

  const renderActiveTabContent = () => {
    if (loading) {
      return activeTab === 'companies' ? 
        <CompaniesLoadingSkeleton /> : 
        <CustomersLoadingSkeleton />;
    }
    
    if (error) {
      return <ErrorState error={error} onRetry={fetchData} />;
    }
    
    if (activeTab === 'companies') {
      if (companies.length === 0) {
        return <EmptyState type="companies" searchTerm={searchTerm} />;
      }
      
      return view === 'grid' ? 
        <CompaniesGridView companies={companies} getUserCount={getUserCount} /> : 
        <CompaniesTableView companies={companies} getUserCount={getUserCount} />;
    } else {
      if (companyUsers.length === 0) {
        return <EmptyState type="customers" searchTerm={searchTerm} />;
      }
      
      return view === 'grid' ? 
        <CustomersGridView users={companyUsers} getCompanyName={getCompanyName} /> : 
        <CustomersTableView users={companyUsers} getCompanyName={getCompanyName} />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={fetchData}
        searchPlaceholder={getSearchPlaceholder()}
      />
      
      <Tabs defaultValue="companies" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building className="h-4 w-4" /> 
              Companies ({totalCompanies})
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> 
              Customers ({totalUsers})
            </TabsTrigger>
          </TabsList>
          
          <ViewToggle view={view} onViewChange={setView} />
        </div>
        
        <div className="mt-4">
          {renderActiveTabContent()}
        </div>
      </Tabs>
    </div>
  );
};

export default CompaniesCustomersPage;
