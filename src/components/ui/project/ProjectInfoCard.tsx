
import { useState, useEffect } from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Avatar } from '../../ui/avatar';
import { formatDate } from '@/utils/date-utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface ProjectInfoCardProps {
  project: any;
  isEditing: boolean;
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  statusColors: Record<string, string>;
  StatusIcon: any;
}

const ProjectInfoCard = ({ 
  project, 
  isEditing, 
  formData, 
  handleInputChange,
  statusColors,
  StatusIcon
}: ProjectInfoCardProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assignedUser, setAssignedUser] = useState<User | null>(null);

  useEffect(() => {
    if (project.company_id) {
      fetchCompanyUsers(project.company_id);
    }
  }, [project.company_id]);

  useEffect(() => {
    if (project.assigned_to) {
      fetchAssignedUser(project.assigned_to);
    }
  }, [project.assigned_to]);

  const fetchCompanyUsers = async (companyId: string) => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('company_users')
        .select('user_id, email, full_name, avatar_url')
        .eq('company_id', companyId);

      if (error) throw error;

      const formattedUsers = (data || []).map(user => ({
        id: user.user_id,
        email: user.email || '',
        full_name: user.full_name || '',
        avatar_url: user.avatar_url
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching company users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAssignedUser = async (userId: string) => {
    try {
      // Don't use maybeSingle here since it's causing issues with multiple matches
      const { data, error } = await supabase
        .from('company_users')
        .select('user_id, email, full_name, avatar_url')
        .eq('user_id', userId);

      if (error) throw error;

      if (data && data.length > 0) {
        // Take the first matching user (there should only be one user with this ID anyway)
        const user = data[0];
        setAssignedUser({
          id: user.user_id,
          email: user.email || '',
          full_name: user.full_name || '',
          avatar_url: user.avatar_url
        });
      }
    } catch (error) {
      console.error('Error fetching assigned user:', error);
      toast({
        title: "Error",
        description: "Could not load assigned user information",
        variant: "destructive"
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    const event = {
      target: {
        name,
        value
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleInputChange(event);

    // If we're changing the assigned user, update the UI immediately
    if (name === 'assigned_to' && value !== 'unassigned') {
      const selectedUser = users.find(user => user.id === value);
      if (selectedUser) {
        setAssignedUser(selectedUser);
      }
    } else if (name === 'assigned_to' && value === 'unassigned') {
      setAssignedUser(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Project Details</h3>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="resize-none"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    name="status"
                    defaultValue={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="assigned_to">Assigned To</Label>
                  <Select
                    name="assigned_to"
                    defaultValue={formData.assigned_to || 'unassigned'}
                    onValueChange={(value) => handleSelectChange('assigned_to', value)}
                    disabled={loadingUsers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <Badge className={statusColors[project.status] || 'bg-gray-100'}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-gray-600">{project.description || 'No description available.'}</p>
                
                <div className="pt-2">
                  <h4 className="text-sm font-medium text-gray-900">Assigned To</h4>
                  <div className="mt-1 flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      {assignedUser?.avatar_url ? (
                        <img src={assignedUser.avatar_url} alt={assignedUser.full_name || ''} />
                      ) : (
                        <div className="bg-primary text-primary-foreground flex items-center justify-center h-full w-full text-sm">
                          {assignedUser ? (assignedUser.full_name?.[0] || 'U') : 'U'}
                        </div>
                      )}
                    </Avatar>
                    <span className="text-gray-700">
                      {assignedUser ? 
                        (assignedUser.full_name || assignedUser.email) : 
                        'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Project Timeline</h3>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="Enter budget amount"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    {project.start_date ? (
                      <>Start: {formatDate(project.start_date)}</>
                    ) : (
                      'No start date set'
                    )}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    {project.end_date ? (
                      <>End: {formatDate(project.end_date)}</>
                    ) : (
                      'No end date set'
                    )}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <DollarSign className="mr-2 h-4 w-4" />
                  <span>
                    {project.budget ? (
                      <>Budget: ${project.budget.toLocaleString()}</>
                    ) : (
                      'No budget set'
                    )}
                  </span>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Company</h4>
                  <p className="text-gray-600">{project.company_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectInfoCard;
