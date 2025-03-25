
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { 
  Calendar, Clock, FileText, MessageSquare, CheckCircle, XCircle, 
  AlertTriangle, BarChart, Edit, Trash2, FileUp, Plus
} from 'lucide-react';
import { toast } from "../../../hooks/use-toast";
import ProjectMilestones from './ProjectMilestones';
import ProjectFeedback from './ProjectFeedback';
import ProjectFiles from './ProjectFiles';
import ProjectExcelData from './ProjectExcelData';
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { useAuth } from '../../../context/AuthContext';

interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  status: string;
  company_id: string;
  company_name: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  'planning': 'bg-blue-100 text-blue-700',
  'in_progress': 'bg-amber-100 text-amber-700',
  'review': 'bg-purple-100 text-purple-700',
  'completed': 'bg-green-100 text-green-700',
  'canceled': 'bg-red-100 text-red-700',
};

const statusIcons = {
  'planning': FileText,
  'in_progress': Clock,
  'review': AlertTriangle,
  'completed': CheckCircle,
  'canceled': XCircle,
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: '',
    start_date: '',
    end_date: '',
    budget: '',
  });
  
  const canEdit = isAdmin || (isManager && project?.company_id === user?.companyId);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select(`
            *,
            companies:company_id(name)
          `)
          .eq('id', id)
          .single();
          
        if (projectError) throw projectError;
        
        if (projectData) {
          const formattedProject = {
            id: projectData.id,
            name: projectData.name,
            description: projectData.description || '',
            status: projectData.status,
            company_id: projectData.company_id,
            company_name: projectData.companies?.name || 'Unknown Company',
            start_date: projectData.start_date,
            end_date: projectData.end_date,
            budget: projectData.budget,
            created_at: projectData.created_at,
            updated_at: projectData.updated_at
          };
          
          setProject(formattedProject);
          setFormData({
            name: formattedProject.name,
            description: formattedProject.description,
            status: formattedProject.status,
            start_date: formattedProject.start_date || '',
            end_date: formattedProject.end_date || '',
            budget: formattedProject.budget?.toString() || '',
          });
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
        toast({
          title: "Error",
          description: "Failed to load project details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [id]);
  
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
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state with new data
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
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Project deleted successfully.",
      });
      
      // Navigate back to projects list
      navigate('/admin/projects');
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="text-2xl font-bold border rounded px-2 py-1 w-full"
            />
          ) : (
            <h1 className="text-2xl font-bold">{project.name}</h1>
          )}
          <p className="text-gray-500">For {project.company_name}</p>
        </div>
        
        {canEdit && !isEditing && (
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
            >
              <Edit size={16} className="mr-2" />
              Edit Project
            </Button>
            <Button 
              onClick={handleDelete}
              variant="destructive"
              size="sm"
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        )}
        
        {isEditing && (
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit}
              size="sm"
            >
              Save Changes
            </Button>
            <Button 
              onClick={() => setIsEditing(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      
      <Card className="p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter budget amount"
                step="0.01"
              />
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Status</p>
                <div className="flex items-center mt-1">
                  <Badge className={`flex items-center gap-1 ${statusColors[project.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>
                    <StatusIcon size={14} />
                    <span className="capitalize">{project.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-gray-500 text-sm">Budget</p>
                <p className="font-semibold">
                  {project.budget ? `$${project.budget.toLocaleString()}` : 'Not specified'}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-gray-500 text-sm">Timeline</p>
              <div className="flex items-center mt-1 text-sm">
                <Calendar size={16} className="mr-2 text-gray-500" />
                {project.start_date && project.end_date ? (
                  <span>
                    {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                  </span>
                ) : project.start_date ? (
                  <span>Starts on {new Date(project.start_date).toLocaleDateString()}</span>
                ) : project.end_date ? (
                  <span>Due by {new Date(project.end_date).toLocaleDateString()}</span>
                ) : (
                  <span className="text-gray-500">No dates specified</span>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-gray-500 text-sm">Description</p>
              <p className="mt-1">{project.description || 'No description provided.'}</p>
            </div>
          </div>
        )}
      </Card>
      
      <Tabs defaultValue="milestones" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="milestones">Milestones & Tasks</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="excel">Excel Data</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="milestones">
          <ProjectMilestones projectId={project.id} canEdit={canEdit} />
        </TabsContent>
        
        <TabsContent value="files">
          <ProjectFiles projectId={project.id} canEdit={canEdit} />
        </TabsContent>
        
        <TabsContent value="excel">
          <ProjectExcelData projectId={project.id} canEdit={canEdit} />
        </TabsContent>
        
        <TabsContent value="feedback">
          <ProjectFeedback projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
