
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "./use-toast";
import { ProjectDetails } from './use-project-detail';

export interface CompanyUser {
  user_id: string;
  email: string;
  full_name?: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: string;
  assigned_to: string;
}

export function useProjectEdit(project: ProjectDetails | null, isAdmin: boolean, user: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<CompanyUser[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: '',
    start_date: '',
    end_date: '',
    budget: '',
    assigned_to: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        budget: project.budget?.toString() || '',
        assigned_to: project.assigned_to || '',
      });
      
      if (isAdmin) {
        fetchAllUsers();
      } else if (project.company_id) {
        fetchCompanyUsers(project.company_id);
      }
    }
  }, [project, isAdmin]);
  
  const fetchCompanyUsers = async (companyId: string) => {
    try {
      console.log('Fetching company users for company:', companyId);
      
      const { data, error } = await supabase
        .from('company_users')
        .select('user_id, email, full_name')
        .eq('company_id', companyId);
        
      if (error) {
        console.error('Error fetching company users:', error);
        throw error;
      }
      
      console.log('Company users fetched:', data);
      setAvailableUsers(data || []);
    } catch (error) {
      console.error('Error fetching company users:', error);
      toast({
        title: "Error",
        description: "Failed to load company users. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const fetchAllUsers = async () => {
    try {
      console.log('Fetching all users as admin');
      
      const { data, error } = await supabase
        .from('company_users')
        .select('user_id, email, full_name');
        
      if (error) {
        console.error('Error fetching all users:', error);
        throw error;
      }
      
      console.log('All users fetched:', data?.length || 0);
      setAvailableUsers(data || []);
    } catch (error) {
      console.error('Error fetching all users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return {
    isEditing,
    setIsEditing,
    formData,
    availableUsers,
    handleInputChange,
    fetchCompanyUsers,
    fetchAllUsers
  };
}
