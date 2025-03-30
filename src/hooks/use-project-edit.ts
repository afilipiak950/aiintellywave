
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { ProjectDetails } from './use-project-detail';
import { User } from '../context/auth/types';

export interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  assigned_to: string;
}

interface CompanyUser {
  user_id: string;
  email: string;
  full_name?: string;
}

export const useProjectEdit = (
  project: ProjectDetails | null, 
  isAdmin: boolean, 
  currentUser: User | null
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<CompanyUser[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'planning',
    start_date: '',
    end_date: '',
    assigned_to: ''
  });
  
  // Fetch available users for assignment
  useEffect(() => {
    const fetchUsersForCompany = async () => {
      if (!project) return;
      
      try {
        // Allow admins to see all users for assignment
        const { data, error } = isAdmin
          ? await supabase
              .from('company_users')
              .select('user_id, email, full_name')
          : await supabase
              .from('company_users')
              .select('user_id, email, full_name')
              .eq('company_id', project.company_id);
              
        if (error) {
          console.error('Error fetching company users:', error);
          return;
        }
        
        if (data) {
          setAvailableUsers(data);
        }
      } catch (error) {
        console.error('Error in users fetch:', error);
      }
    };
    
    fetchUsersForCompany();
  }, [project, isAdmin]);
  
  // Update form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'planning',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        assigned_to: project.assigned_to || '',
      });
    }
  }, [project]);
  
  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return {
    isEditing,
    setIsEditing,
    formData,
    availableUsers,
    handleInputChange
  };
};
