
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { useAuth } from '../context/AuthContext';

interface Company {
  id: string;
  name: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  company_id: string;
  start_date: string;
  end_date: string;
  budget: string;
}

export const useProjectForm = (onProjectCreated: () => void, onClose: () => void) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'planning',
    company_id: '',
    start_date: '',
    end_date: '',
    budget: '',
  });

  useEffect(() => {
    resetForm();
  }, [user?.companyId]);

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
        } else if (data.length > 0) {
          setFormData(prev => ({ ...prev, company_id: data[0].id }));
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
    loading,
    formData,
    fetchCompanies,
    handleInputChange,
    handleSelectChange,
    handleSubmit
  };
};
