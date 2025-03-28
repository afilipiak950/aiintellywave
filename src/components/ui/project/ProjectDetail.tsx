import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../integrations/supabase/client';
import { 
  FileText, Clock, CheckCircle, XCircle, 
  AlertTriangle, LucideIcon
} from 'lucide-react';
import { toast } from "../../../hooks/use-toast";
import { Button } from "../../ui/button";
import { useAuth } from '../../../context/auth';
import { useProjectDetail } from '../../../hooks/use-project-detail';
import ProjectHeader from './ProjectHeader';
import ProjectInfoCard from './ProjectInfoCard';
import ProjectTabs from './ProjectTabs';

const statusColors = {
  'planning': 'bg-blue-100 text-blue-700',
  'in_progress': 'bg-amber-100 text-amber-700',
  'review': 'bg-purple-100 text-purple-700',
  'completed': 'bg-green-100 text-green-700',
  'canceled': 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, LucideIcon> = {
  'planning': FileText,
  'in_progress': Clock,
  'review': AlertTriangle,
  'completed': CheckCircle,
  'canceled': XCircle,
};

interface ProjectDetailProps {
  projectId: string;
}

interface CompanyUser {
  user_id: string;
  email: string;
  full_name?: string;
}

const ProjectDetail = ({ projectId }: ProjectDetailProps) => {
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  const { project, loading, setProject } = useProjectDetail(projectId);
  const [isEditing, setIsEditing] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<CompanyUser[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: '',
    start_date: '',
    end_date: '',
    budget: '',
    assigned_to: '',
  });
  
  const canEdit = isAdmin || (isManager && project?.company_id === user?.companyId);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        assigned_to: formData.assigned_to || null,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);
        
      if (error) throw error;
      
      if (project) {
        setProject({
          ...project,
          ...updateData,
        });
      }
      
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Project details updated successfully.",
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Project deleted successfully.",
      });
      
      if (isAdmin) {
        navigate('/admin/projects');
      } else if (isManager) {
        navigate('/manager/projects');
      } else {
        navigate('/customer/projects');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const StatusIcon = project?.status && statusIcons[project.status as keyof typeof statusIcons] || FileText;
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Project not found</h2>
        <p className="text-gray-500 mt-2">The requested project could not be found.</p>
        <Button 
          className="mt-4"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <ProjectHeader 
        project={project}
        canEdit={canEdit}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleDelete={handleDelete}
        handleSubmit={handleSubmit}
        formData={formData}
        handleInputChange={handleInputChange}
        availableUsers={availableUsers}
      />
      
      <ProjectInfoCard 
        project={project}
        isEditing={isEditing}
        formData={formData}
        handleInputChange={handleInputChange}
        statusColors={statusColors}
        StatusIcon={StatusIcon}
        availableUsers={availableUsers}
      />
      
      <ProjectTabs projectId={project.id} canEdit={canEdit} />
    </div>
  );
};

export default ProjectDetail;
