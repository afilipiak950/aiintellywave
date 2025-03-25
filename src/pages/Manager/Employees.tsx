
import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../context/AuthContext';
import { UserRound, Search, Mail, Phone } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';

interface Employee {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_admin: boolean;
}

const EmployeesPage = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchManagerCompany = async () => {
      if (!user) return;
      
      try {
        // Get the company this user is a manager of
        const { data, error } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .eq('is_admin', true)
          .single();
        
        if (error) throw error;
        
        if (data && data.company_id) {
          setCompanyId(data.company_id);
          fetchEmployees(data.company_id);
        }
      } catch (error) {
        console.error('Error fetching manager company:', error);
        setLoading(false);
      }
    };
    
    fetchManagerCompany();
  }, [user]);

  const fetchEmployees = async (companyId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('company_users')
        .select(`
          id,
          user_id,
          is_admin,
          profiles:user_id (
            first_name,
            last_name,
            position,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('company_id', companyId);
      
      if (error) throw error;
      
      // Transform the data
      const formattedData = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        is_admin: item.is_admin,
        first_name: item.profiles?.first_name || null,
        last_name: item.profiles?.last_name || null,
        position: item.profiles?.position || null,
        email: item.profiles?.email || null,
        phone: item.profiles?.phone || null,
        avatar_url: item.profiles?.avatar_url || null,
      }));
      
      setEmployees(formattedData);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.toLowerCase();
    const position = (employee.position || '').toLowerCase();
    const email = (employee.email || '').toLowerCase();
    
    return fullName.includes(searchLower) || 
           position.includes(searchLower) || 
           email.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Company Employees</h1>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search employees..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <Card key={employee.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 rounded-full p-3">
                      <UserRound className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium text-gray-900 truncate">
                        {employee.first_name} {employee.last_name}
                      </p>
                      {employee.position && (
                        <p className="text-sm text-gray-500">{employee.position}</p>
                      )}
                      {employee.is_admin && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                          Company Manager
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {employee.email && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{employee.email}</span>
                      </div>
                    )}
                    {employee.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{employee.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 py-10 text-center">
            <UserRound className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? "No employees match your search criteria." : "No employees in this company yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;
