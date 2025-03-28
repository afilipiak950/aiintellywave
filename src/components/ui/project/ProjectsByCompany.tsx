
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ChevronDown, ChevronUp, FolderOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useAuth } from '../../../context/auth';
import { CompanyWithProjects } from '@/hooks/use-company-projects';
import CompanyProjectItem from './CompanyProjectItem';
import CompanyInfo from './CompanyInfo';
import CompanyProjectsLoading from './CompanyProjectsLoading';
import CompanyProjectsError from './CompanyProjectsError';
import CompanyProjectsEmpty from './CompanyProjectsEmpty';

interface ProjectsByCompanyProps {
  companies: CompanyWithProjects[];
  loading: boolean;
  error: string | null;
  basePath: string;
}

const ProjectsByCompany = ({ companies, loading, error, basePath }: ProjectsByCompanyProps) => {
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();
  const [openCompanies, setOpenCompanies] = useState<Record<string, boolean>>({});

  // Open the first company by default
  useState(() => {
    if (companies.length > 0 && Object.keys(openCompanies).length === 0) {
      setOpenCompanies({ [companies[0].id]: true });
    }
  });

  const toggleCompany = (companyId: string) => {
    setOpenCompanies(prev => ({
      ...prev,
      [companyId]: !prev[companyId]
    }));
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`${basePath}/${projectId}`);
  };

  if (loading) {
    return <CompanyProjectsLoading />;
  }

  if (error) {
    return <CompanyProjectsError error={error} />;
  }

  if (!companies.length) {
    return <CompanyProjectsEmpty />;
  }

  return (
    <div className="space-y-6">
      {companies.map(company => {
        const isOpen = openCompanies[company.id] || false;
        const { projects } = company;
        
        return (
          <Collapsible 
            key={company.id} 
            open={isOpen}
            onOpenChange={() => toggleCompany(company.id)}
            className="border rounded-lg shadow-sm"
          >
            <Card>
              <CardHeader className="px-6 py-4 border-b bg-gray-50">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-600" />
                      <CardTitle className="text-xl">{company.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-500">
                        {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
              </CardHeader>
              
              <CollapsibleContent>
                <CardContent className="p-0">
                  {/* Company Info Section */}
                  <CompanyInfo company={company} />
                  
                  {/* Projects Section */}
                  <div>
                    <div className="p-4 flex items-center space-x-2 border-b">
                      <FolderOpen className="h-5 w-5 text-gray-600" />
                      <h3 className="font-medium">Company Projects</h3>
                    </div>
                    
                    {projects.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        No projects associated with this company
                      </div>
                    ) : (
                      <div className="divide-y">
                        {projects.map(project => (
                          <CompanyProjectItem 
                            key={project.id} 
                            project={project} 
                            onProjectClick={handleProjectClick} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default ProjectsByCompany;
