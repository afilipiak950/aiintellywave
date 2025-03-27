import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { useAuth } from '../context/auth';

interface Company {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
}

export interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  company_id: string;
  start_date: string;
  end_date: string;
  budget: string;
  assigned_to: string;
}

export const useProjectForm = (onProjectCreated: () => void, onClose: () => void) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'planning',
    company_id: user?.companyId || '',
    start_date: '',
    end_date: '',
    budget: '',
    assigned_to: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, [user?.companyId]);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchCompanyUsers(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setCompanies(data);
        // Set default company if the user has one
        if (user?.companyId && data.find(c => c.id === user.companyId)) {
          setFormData(prev => ({ ...prev, company_id: user.companyId }));
          setSelectedCompanyId(user.companyId);
        } else if (data.length > 0) {
          setFormData(prev => ({ ...prev, company_id: data[0].id }));
          setSelectedCompanyId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyUsers = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('company_users')
        .select('user_id, email, full_name')
        .eq('company_id', companyId);
        
      if (error) throw error;
      
      if (data) {
        const formattedUsers = data.map(user => ({
          id: user.user_id,
          email: user.email || '',
          full_name: user.full_name,
        }));
        
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching company users:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'company_id' && value !== selectedCompanyId) {
      setSelectedCompanyId(value);
      // Reset assigned_to when company changes
      setFormData(prev => ({ ...prev, company_id: value, assigned_to: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'planning',
      company_id: user?.companyId || '',
      start_date: '',
      end_date: '',
      budget: '',
      assigned_to: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const projectData = {
        name: formData.name,
        description: formData.description || null,
        status: formData.status,
        company_id: formData.company_id,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        assigned_to: formData.assigned_to || null,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('projects')
        .insert(projectData);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Project created successfully.",
      });
      
      onProjectCreated();
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    companies,
    users,
    loading,
    formData,
    fetchCompanies,
    fetchCompanyUsers,
    handleInputChange,
    handleSelectChange,
    handleSubmit
  };
};
