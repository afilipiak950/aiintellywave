
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CompanyUser {
  company_id: string;
  company_name: string;
  user_count: number;
}

const CompanyUsersChart = () => {
  const [companyData, setCompanyData] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const colors = ['#4069E5', '#9b87f5', '#8B5CF6', '#10b981', '#FBBF24', '#F87171'];
  
  useEffect(() => {
    const fetchCompanyUsers = async () => {
      try {
        setLoading(true);
        
        // First, get all companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name');
          
        if (companiesError) {
          console.error('Error fetching companies:', companiesError);
          return;
        }
        
        if (!companiesData || companiesData.length === 0) {
          setCompanyData([]);
          return;
        }
        
        // Then, for each company, count users
        const companiesWithUserCounts = await Promise.all(companiesData.map(async (company) => {
          const { data: companyUsers, error: usersError, count } = await supabase
            .from('company_users')
            .select('user_id', { count: 'exact' })
            .eq('company_id', company.id);
            
          if (usersError) {
            console.error(`Error fetching users for company ${company.name}:`, usersError);
            return {
              company_id: company.id,
              company_name: company.name,
              user_count: 0
            };
          }
          
          return {
            company_id: company.id,
            company_name: company.name,
            user_count: count || 0
          };
        }));
        
        // Sort by user count descending
        companiesWithUserCounts.sort((a, b) => b.user_count - a.user_count);
        
        setCompanyData(companiesWithUserCounts);
      } catch (error) {
        console.error('Error in fetchCompanyUsers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyUsers();
  }, []);
  
  const handleBarMouseOver = (data: any, index: number) => {
    setActiveIndex(index);
  };
  
  const handleBarMouseLeave = () => {
    setActiveIndex(null);
  };
  
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm h-full animate-pulse">
        <div className="flex items-center gap-2 mb-6">
          <Building className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-medium">Company Users Distribution</h3>
        </div>
        <div className="h-80 w-full bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }
  
  if (companyData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm h-full">
        <div className="flex items-center gap-2 mb-6">
          <Building className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-medium">Company Users Distribution</h3>
        </div>
        <div className="h-80 w-full flex items-center justify-center text-gray-500">
          No company data available
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full animate-fade-in transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Building className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-medium">Company Users Distribution</h3>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={companyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="company_name" 
              stroke="#9ca3af" 
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => value.toLocaleString()}
              label={{ value: 'Number of Users', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af', fontSize: 12 } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '10px 14px',
              }}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              formatter={(value: number) => [`${value} Users`, 'Users']}
            />
            <Bar 
              dataKey="user_count" 
              name="Users" 
              animationDuration={1500}
              animationEasing="ease-out"
              onMouseOver={handleBarMouseOver}
              onMouseLeave={handleBarMouseLeave}
            >
              {companyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={activeIndex === index ? colors[index % colors.length] : `${colors[index % colors.length]}cc`}
                  stroke={colors[index % colors.length]}
                  strokeWidth={activeIndex === index ? 2 : 0}
                  radius={activeIndex === index ? [4, 4, 4, 4] : [0, 0, 0, 0]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CompanyUsersChart;
