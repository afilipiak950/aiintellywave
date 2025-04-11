
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, Search, Building } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Company {
  id: string;
  name: string;
}

interface CompanyAssignmentTabProps {
  campaignId?: string;
  isLoading?: boolean;
}

const CompanyAssignmentTab = ({
  campaignId,
  isLoading = false
}: CompanyAssignmentTabProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [assignedCompanyIds, setAssignedCompanyIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasCompanyChanges, setHasCompanyChanges] = useState(false);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setCompanies(data || []);
        setFilteredCompanies(data || []);
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load companies',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch assigned companies
  useEffect(() => {
    if (!campaignId) return;

    const fetchAssignedCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('campaign_company_assignments')
          .select('company_id')
          .eq('campaign_id', campaignId);

        if (error) throw error;
        
        const companyIds = data.map(item => item.company_id);
        setAssignedCompanyIds(companyIds);
        setHasCompanyChanges(false);
      } catch (error) {
        console.error('Error fetching assigned companies:', error);
      }
    };

    fetchAssignedCompanies();
  }, [campaignId]);
  
  // Filter companies based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCompanies(companies);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = companies.filter(company => 
      company.name.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredCompanies(filtered);
  }, [searchQuery, companies]);
  
  // Handle company toggle
  const handleCompanyToggle = (companyId: string) => {
    setAssignedCompanyIds(prevIds => {
      if (prevIds.includes(companyId)) {
        return prevIds.filter(id => id !== companyId);
      } else {
        return [...prevIds, companyId];
      }
    });
    setHasCompanyChanges(true);
  };

  // Save company assignments
  const updateCampaignCompanies = async () => {
    if (!campaignId) return false;
    
    setIsUpdating(true);
    try {
      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from('campaign_company_assignments')
        .delete()
        .eq('campaign_id', campaignId);
      
      if (deleteError) {
        throw new Error(`Error deleting existing assignments: ${deleteError.message}`);
      }
      
      if (assignedCompanyIds.length > 0) {
        // Create new assignments
        const assignmentsToInsert = assignedCompanyIds.map(companyId => ({
          campaign_id: campaignId,
          company_id: companyId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('campaign_company_assignments')
          .insert(assignmentsToInsert);
          
        if (insertError) {
          throw new Error(`Error creating new assignments: ${insertError.message}`);
        }
      }
      
      setHasCompanyChanges(false);
      toast({
        title: 'Success',
        description: 'Company assignments updated successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating company assignments:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update company assignments',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || isLoadingCompanies) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Assigned Companies</label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Search companies..."
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Assign companies to make this campaign visible to specific customer companies
        </p>
      </div>
      
      <div className="border rounded-md">
        <ScrollArea className="h-[300px] rounded-md">
          {filteredCompanies.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No companies found matching your search.
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredCompanies.map(company => (
                <div
                  key={company.id}
                  className={`flex items-center space-x-3 p-2 rounded-md ${
                    assignedCompanyIds.includes(company.id) ? 'bg-primary/10' : 'hover:bg-accent'
                  }`}
                >
                  <Checkbox
                    id={`company-${company.id}`}
                    checked={assignedCompanyIds.includes(company.id)}
                    onCheckedChange={() => handleCompanyToggle(company.id)}
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`company-${company.id}`}
                      className="flex flex-col text-sm cursor-pointer"
                    >
                      <span className="font-medium">{company.name}</span>
                    </label>
                  </div>
                  <div className="flex items-center justify-center">
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {assignedCompanyIds.length} {assignedCompanyIds.length === 1 ? 'company' : 'companies'} assigned
        </div>
        
        {hasCompanyChanges && (
          <Button 
            onClick={updateCampaignCompanies} 
            disabled={isUpdating} 
            className="w-full sm:w-auto"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>
      
      {companies.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No companies available to assign to this campaign.
        </div>
      )}
    </div>
  );
};

export default CompanyAssignmentTab;
