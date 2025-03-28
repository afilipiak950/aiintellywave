import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Building2, MapPin, Mail, Phone, Globe, User, PlusCircle } from 'lucide-react';
import CompanyActionMenu from './CompanyActionMenu';

interface Company {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  website?: string;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
}

interface CompanyUsersListProps {
  companies: Company[];
  usersByCompany: Record<string, User[]>;
  onCompanyUpdated: () => void;
}

const CompanyUsersList = ({ companies, usersByCompany, onCompanyUpdated }: CompanyUsersListProps) => {
  const navigate = useNavigate();
  
  const handleUserClick = (userId: string) => {
    navigate(`/admin/customers/${userId}`);
  };

  return (
    <div className="space-y-6">
      {companies.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No companies</h3>
          <p className="mt-1 text-sm text-gray-500">
            No companies have been added yet.
          </p>
        </div>
      ) : (
        companies.map((company) => (
          <Card key={company.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {company.name}
                </CardTitle>
              </div>
              <CompanyActionMenu 
                company={company}
                onCompanyUpdated={onCompanyUpdated}
              />
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Company information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Company Information</h4>
                  
                  {(company.city || company.country) && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                      <span className="text-sm">
                        {[company.city, company.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  
                  {company.contact_email && (
                    <div className="flex items-start">
                      <Mail className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                      <span className="text-sm">{company.contact_email}</span>
                    </div>
                  )}
                  
                  {company.contact_phone && (
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                      <span className="text-sm">{company.contact_phone}</span>
                    </div>
                  )}
                  
                  {company.website && (
                    <div className="flex items-start">
                      <Globe className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                      <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-sm text-blue-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                  
                  {company.description && (
                    <div className="pt-2">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Description</h4>
                      <p className="text-sm text-gray-600">{company.description}</p>
                    </div>
                  )}
                </div>
                
                {/* Company users */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Company Users</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Handle adding user to company - future functionality
                      }}
                    >
                      <PlusCircle className="h-3.5 w-3.5 mr-1" />
                      Add User
                    </Button>
                  </div>
                  
                  {usersByCompany[company.id] && usersByCompany[company.id].length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="users">
                        <AccordionTrigger className="text-sm py-2">
                          {usersByCompany[company.id].length} User{usersByCompany[company.id].length > 1 ? 's' : ''}
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2">
                            {usersByCompany[company.id].map((user) => (
                              <li key={user.id} 
                                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                                  onClick={() => handleUserClick(user.id)}
                              >
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="text-sm font-medium">
                                    {user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown User'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full capitalize">
                                    {user.role || 'User'}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-md">
                      <User className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-1 text-sm text-gray-500">No users in this company</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default CompanyUsersList;
