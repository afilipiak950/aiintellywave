
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MoreVertical, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: string;
  company_id: string;
  is_manager_kpi_enabled: boolean;
  status?: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
}

interface Lead {
  id: string;
  name: string;
  status: string;
}

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeText = "";
  // Define the variant explicitly as one of the allowed types, with a default value
  let badgeVariant: "default" | "destructive" | "outline" | "secondary" = "default";

  switch (status) {
    case "active":
      badgeText = "Active";
      badgeVariant = "outline";
      break;
    case "inactive":
      badgeText = "Inactive";
      badgeVariant = "destructive";
      break;
    case "planning":
      badgeText = "Planning";
      break;
    // Removed duplicate "active" case
    case "completed":
      badgeText = "Completed";
      break;
    default:
      badgeText = "Unknown";
      break;
  }

  return <Badge variant={badgeVariant}>{badgeText}</Badge>;
};

const ManagerDashboardContainer: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user?.id) {
          throw new Error("User not authenticated");
        }

        // Fetch user's company ID
        const { data: companyUser, error: companyUserError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .single();

        if (companyUserError) {
          throw companyUserError;
        }

        if (!companyUser) {
          throw new Error("Company user not found");
        }

        const companyId = companyUser.company_id;

        // Fetch users in the same company
        const { data: usersData, error: usersError } = await supabase
          .from('company_users')
          .select('*')
          .eq('company_id', companyId);

        if (usersError) {
          throw usersError;
        }

        // Fetch projects for the company
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('company_id', companyId);

        if (projectsError) {
          throw projectsError;
        }

        // Fix: Convert array of project IDs to comma-separated string for the 'in' filter
        // or use separate queries if there are projects
        let campaignsData = [];
        let leadsData = [];
        
        if (projectsData && projectsData.length > 0) {
          // Fetch campaigns for the company - fix the array issue by using .in() with project IDs
          const projectIds = projectsData.map(p => p.id);
          const { data: fetchedCampaigns, error: campaignsError } = await supabase
            .from('campaigns')
            .select('*')
            .in('project_id', projectIds);

          if (campaignsError) {
            throw campaignsError;
          }
          
          campaignsData = fetchedCampaigns || [];

          // Fetch leads for the company - fix the array issue by using .in() with project IDs
          const { data: fetchedLeads, error: leadsError } = await supabase
            .from('leads')
            .select('*')
            .in('project_id', projectIds);

          if (leadsError) {
            throw leadsError;
          }
          
          leadsData = fetchedLeads || [];
        }

        setUsers(usersData as User[]);
        setProjects(projectsData as Project[]);
        setCampaigns(campaignsData as Campaign[]);
        setLeads(leadsData as Lead[]);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data");
        toast({
          title: "Error",
          description: err.message || "Failed to fetch data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Users Card */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Active users in your company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ScrollArea className="h-[300px] w-full rounded-md border">
                <div className="p-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={user.status || 'active'} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="relative h-8 w-8 rounded-full p-0 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                              aria-label="Open user menu"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-sm text-muted-foreground">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Card */}
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Ongoing projects in your company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Website Redesign</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="relative h-8 w-8 rounded-full p-0 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                      aria-label="Open project menu"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Progress value={70} />
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Mobile App Development</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="relative h-8 w-8 rounded-full p-0 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                      aria-label="Open project menu"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Progress value={30} />
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">New Marketing Campaign</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="relative h-8 w-8 rounded-full p-0 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                      aria-label="Open project menu"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Progress value={50} />
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Total Projects</p>
                <p className="text-sm text-muted-foreground">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Card */}
        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
            <CardDescription>Active marketing campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Summer Sale 2023</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="relative h-8 w-8 rounded-full p-0 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                      aria-label="Open campaign menu"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Progress value={80} />
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Back to School Promo</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="relative h-8 w-8 rounded-full p-0 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                      aria-label="Open campaign menu"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Progress value={60} />
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Total Campaigns</p>
                <p className="text-sm text-muted-foreground">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboardContainer;
