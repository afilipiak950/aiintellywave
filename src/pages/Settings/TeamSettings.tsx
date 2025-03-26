import { useState, useEffect } from 'react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import { useAuth } from '../../context/auth';
import { supabase } from '../../integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from '../../hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { ChevronDown, Edit, Trash, Mail, Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Label } from "@/components/ui/label";

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

const TeamSettings = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    role: 'customer'
  });
  
  const getBasePath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'manager') return '/manager';
    return '/customer';
  };
  
  const basePath = getBasePath();
  
  const fetchTeamMembers = async () => {
    if (!user?.companyId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('company_users')
        .select('id, user_id, full_name, email, role, avatar_url')
        .eq('company_id', user.companyId);
        
      if (error) throw error;
      
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTeamMembers();
  }, [user]);
  
  const filteredMembers = teamMembers.filter(member => 
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleInviteUser = async () => {
    if (!user?.companyId) return;
    
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('company_users')
        .select('id')
        .eq('email', formData.email)
        .eq('company_id', user.companyId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingUser) {
        toast({
          title: "User already exists",
          description: "A user with this email already exists in your team",
          variant: "destructive"
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('company_users')
        .insert({
          company_id: user.companyId,
          email: formData.email,
          role: formData.role,
          full_name: formData.email.split('@')[0],
          is_admin: formData.role === 'admin'
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "User invited",
        description: "The user has been added to your team"
      });
      
      setFormData({ email: '', role: 'customer' });
      setIsAddDialogOpen(false);
      fetchTeamMembers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Failed to invite user. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateRole = async () => {
    if (!selectedMember || !user?.companyId) return;
    
    try {
      const { error } = await supabase
        .from('company_users')
        .update({ 
          role: formData.role,
          is_admin: formData.role === 'admin'
        })
        .eq('id', selectedMember.id)
        .eq('company_id', user.companyId);
        
      if (error) throw error;
      
      toast({
        title: "Role updated",
        description: `${selectedMember.full_name}'s role has been updated`
      });
      
      setIsEditDialogOpen(false);
      fetchTeamMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveUser = async (member: TeamMember) => {
    if (!user?.companyId) return;
    
    try {
      const { error } = await supabase
        .from('company_users')
        .delete()
        .eq('id', member.id)
        .eq('company_id', user.companyId);
        
      if (error) throw error;
      
      toast({
        title: "User removed",
        description: `${member.full_name} has been removed from the team`
      });
      
      fetchTeamMembers();
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: "Error",
        description: "Failed to remove user. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({ email: member.email, role: member.role });
    setIsEditDialogOpen(true);
  };
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <SettingsLayout basePath={basePath}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Team Management</h1>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage users in your team</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search members..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-gray-500">No team members found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm text-gray-500 border-b">
                    <div className="col-span-5">Name</div>
                    <div className="col-span-3">Role</div>
                    <div className="col-span-2">Email</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  
                  <div className="divide-y">
                    {filteredMembers.map((member) => (
                      <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                        <div className="col-span-5 flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                            {member.full_name ? member.full_name[0].toUpperCase() : 'U'}
                          </div>
                          <span className="font-medium">{member.full_name || 'Unnamed User'}</span>
                        </div>
                        <div className="col-span-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {member.role}
                          </span>
                        </div>
                        <div className="col-span-2 truncate" title={member.email}>
                          {member.email || 'No email'}
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(member)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`mailto:${member.email}`)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleRemoveUser(member)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to a new team member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteUser} disabled={!formData.email}>
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
              <DialogDescription>
                Change the role for {selectedMember?.full_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input 
                  id="editEmail" 
                  value={selectedMember?.email || ''}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRole}>
                Update Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SettingsLayout>
  );
};

export default TeamSettings;
