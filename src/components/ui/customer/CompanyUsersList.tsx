
import { useState } from 'react';
import { ChevronDown, ChevronUp, Building, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { CompanyData, UserData } from '@/services/types/customerTypes';

interface CompanyUsersListProps {
  companies: CompanyData[];
  usersByCompany: Record<string, UserData[]>;
}

const CompanyUsersList = ({ companies, usersByCompany }: CompanyUsersListProps) => {
  const [openCompanies, setOpenCompanies] = useState<Record<string, boolean>>({});

  const toggleCompany = (companyId: string) => {
    setOpenCompanies(prev => ({
      ...prev,
      [companyId]: !prev[companyId]
    }));
  };

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
        const companyUsers = usersByCompany[company.id] || [];
        
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
                        {companyUsers.length} {companyUsers.length === 1 ? 'user' : 'users'}
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
                  <div className="p-4 text-sm text-gray-600">
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
                      {company.city && company.country && (
                        <div>
                          <span className="font-medium">Location:</span> {company.city}, {company.country}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t">
                    <div className="p-4 flex items-center space-x-2">
                      <Users className="h-5 w-5 text-gray-600" />
                      <h3 className="font-medium">Company Users</h3>
                    </div>
                    
                    {companyUsers.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        No users associated with this company
                      </div>
                    ) : (
                      <div className="divide-y">
                        {companyUsers.map(user => (
                          <div key={user.user_id} className="p-4 hover:bg-gray-50 flex items-center">
                            <div className="flex-shrink-0 mr-4">
                              <Avatar>
                                {user.avatar_url ? (
                                  <img src={user.avatar_url} alt={user.full_name || 'User'} />
                                ) : (
                                  <div className="bg-primary text-primary-foreground flex items-center justify-center h-full w-full text-lg">
                                    {(user.first_name?.[0] || '') + (user.last_name?.[0] || '')}
                                  </div>
                                )}
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User'}
                              </p>
                              <div className="text-sm text-gray-500 space-y-1">
                                <p>{user.email}</p>
                                {user.role && (
                                  <p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                      {user.role}
                                    </span>
                                    {user.is_admin && (
                                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Admin
                                      </span>
                                    )}
                                  </p>
                                )}
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

export default CompanyUsersList;
