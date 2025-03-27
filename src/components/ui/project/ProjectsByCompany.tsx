import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ChevronDown, ChevronUp, FolderOpen, User, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../../context/auth';
import { CompanyWithProjects } from '@/hooks/use-company-projects';
import { formatDate } from '@/utils/date-utils';

interface ProjectsByCompanyProps {
  companies: CompanyWithProjects[];
  loading: boolean;
  error: string | null;
  basePath: string;
}

const statusColors: Record<string, string> = {
  'planning': 'bg-blue-100 text-blue-700',
  'in_progress': 'bg-amber-100 text-amber-700',
  'review': 'bg-purple-100 text-purple-700',
  'completed': 'bg-green-100 text-green-700',
  'canceled': 'bg-red-100 text-red-700',
};

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
    return (
      <div className="space-y-4">
        <div className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <p className="text-red-500 font-medium">{error}</p>
        <p className="text-gray-600 mt-2">Please try again later</p>
      </div>
    );
  }

  if (!companies.length) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <Building className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">No companies found</h3>
        <p className="text-gray-500">No companies are available in the system.</p>
      </div>
    );
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
                  <div className="p-4 border-b text-sm text-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {company.description && (
                        <div>
                          <span className="font-medium">Description:</span> {company.description}
                        </div>
                      )}
                      {company.contact_email && (
                        <div>
                          <span className="font-medium">Email:</span> {company.contact_email}
                        </div>
                      )}
                      {company.contact_phone && (
                        <div>
                          <span className="font-medium">Phone:</span> {company.contact_phone}
                        </div>
                      )}
                      {(company.city || company.country) && (
                        <div>
                          <span className="font-medium">Location:</span> {[company.city, company.country].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
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
                          <div key={project.id} className="p-4 hover:bg-gray-50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-medium text-lg">{project.name}</h4>
                                <p className="text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                                
                                <div className="mt-3 flex flex-wrap gap-2 items-center">
                                  <Badge className={statusColors[project.status] || 'bg-gray-100'}>
                                    {project.status.replace('_', ' ')}
                                  </Badge>
                                  
                                  {project.start_date && (
                                    <div className="text-xs text-gray-500 flex items-center">
                                      <Calendar className="inline h-3 w-3 mr-1" />
                                      {formatDate(project.start_date)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                {/* Assignee */}
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    {project.assignee_avatar ? (
                                      <img src={project.assignee_avatar} alt={project.assignee_name || ''} />
                                    ) : (
                                      <div className="bg-primary text-primary-foreground flex items-center justify-center h-full w-full">
                                        <User className="h-4 w-4" />
                                      </div>
                                    )}
                                  </Avatar>
                                  <div className="text-sm">
                                    {project.assignee_name || 'Unassigned'}
                                  </div>
                                </div>
                                
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleProjectClick(project.id)}
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
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
