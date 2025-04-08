
import React, { useState, useEffect } from 'react';
import { Clock, User, Activity, Folder, FileText, Settings, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface UserActivityProps {
  userId: string;
}

interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
  full_name?: string;
  email?: string;
}

const UserActivityPanel: React.FC<UserActivityProps> = ({ userId }) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const { user } = useAuth();
  
  const pageSize = 15;
  
  useEffect(() => {
    fetchUserActivities();
    
    // Set up real-time subscription for new activities
    const channel = supabase.channel('user-activities-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'user_activities',
          filter: `user_id=eq.${userId}`
        }, 
        () => {
          console.log('New activity detected for user', userId);
          fetchUserActivities();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, page, filter]);
  
  const fetchUserActivities = async () => {
    try {
      setLoading(true);
      console.log(`Fetching activities for user ${userId}, page ${page}, filter: ${filter || 'none'}`);
      
      let query = supabase
        .from('user_activities' as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
        
      if (filter) {
        query = query.eq('entity_type', filter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching user activities:', error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} activities for user ${userId}`);
      
      if (!data) {
        setActivities([]);
        return;
      }
      
      // Generate sample data if no real data and in development
      if (data.length === 0 && process.env.NODE_ENV === 'development' && page === 1) {
        console.log('No activities found, generating sample data for development');
        await generateSampleActivities();
        return;
      }
      
      // Fix: Cast data with type assertion to avoid typescript error
      const typedData = data as unknown as UserActivity[];
      setActivities(prev => page === 1 ? typedData : [...prev, ...typedData]);
      setHasMore(data.length === pageSize);
    } catch (err: any) {
      console.error('Error fetching user activities:', err);
      setError(err.message);
      toast({
        title: "Error loading activities",
        description: err.message || "Failed to load user activities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to generate sample activities for development testing
  const generateSampleActivities = async () => {
    if (!userId || process.env.NODE_ENV !== 'development') return;
    
    try {
      const sampleActivities = [
        {
          user_id: userId,
          entity_type: 'project',
          entity_id: 'sample-project-1',
          action: 'created a new project',
          details: { message: 'Created Project Alpha' },
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
        },
        {
          user_id: userId,
          entity_type: 'lead',
          entity_id: 'sample-lead-1',
          action: 'updated lead',
          details: { message: 'Updated contact information' },
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
        },
        {
          user_id: userId,
          entity_type: 'settings',
          entity_id: 'user-settings',
          action: 'updated settings',
          details: { message: 'Changed notification preferences' },
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
        },
        {
          user_id: userId,
          entity_type: 'user',
          entity_id: userId,
          action: 'updated profile',
          details: { message: 'Updated profile information' },
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() // 3 hours ago
        },
        {
          user_id: userId,
          entity_type: 'project',
          entity_id: 'sample-project-2',
          action: 'changed project status',
          details: { message: 'Changed status to "In Progress"' },
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
        }
      ];
      
      const { error } = await supabase.from('user_activities' as any).insert(sampleActivities);
      
      if (error) {
        console.error('Error creating sample activities:', error);
        return;
      }
      
      console.log('Created sample activities for development');
      fetchUserActivities();
    } catch (err) {
      console.error('Error generating sample activities:', err);
    }
  };
  
  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case 'project':
        return <Folder className="h-4 w-4 text-blue-500" />;
      case 'lead':
        return <User className="h-4 w-4 text-green-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-amber-500" />;
      case 'settings':
        return <Settings className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const formatActivityDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp'); // 'Mar 15, 2023, 3:25 PM'
    } catch (e) {
      return dateString;
    }
  };
  
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };
  
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };
  
  const handleFilterChange = (value: string) => {
    setFilter(value === 'all' ? null : value);
    setPage(1);
  };
  
  const handleRefresh = () => {
    setPage(1);
    fetchUserActivities();
  };
  
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">User Activity History</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track all actions performed by this user
          </p>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
            <p className="font-medium text-red-800">Error loading user activities</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-1 h-4 w-4" /> Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">User Activity History</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track all actions performed by this user
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="ml-1 hidden sm:inline">Refresh</span>
        </Button>
      </div>
      
      <div className="p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all" onClick={() => handleFilterChange('all')}>All</TabsTrigger>
            <TabsTrigger value="project" onClick={() => handleFilterChange('project')}>Projects</TabsTrigger>
            <TabsTrigger value="lead" onClick={() => handleFilterChange('lead')}>Leads</TabsTrigger>
            <TabsTrigger value="settings" onClick={() => handleFilterChange('settings')}>Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <ActivityList 
              activities={activities} 
              loading={loading && page === 1} 
              getActivityIcon={getActivityIcon} 
              formatActivityDate={formatActivityDate}
              formatTimeAgo={formatTimeAgo}
            />
          </TabsContent>
          
          <TabsContent value="project" className="mt-0">
            <ActivityList 
              activities={activities} 
              loading={loading && page === 1} 
              getActivityIcon={getActivityIcon} 
              formatActivityDate={formatActivityDate}
              formatTimeAgo={formatTimeAgo}
            />
          </TabsContent>
          
          <TabsContent value="lead" className="mt-0">
            <ActivityList 
              activities={activities} 
              loading={loading && page === 1} 
              getActivityIcon={getActivityIcon} 
              formatActivityDate={formatActivityDate}
              formatTimeAgo={formatTimeAgo}
            />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <ActivityList 
              activities={activities} 
              loading={loading && page === 1} 
              getActivityIcon={getActivityIcon} 
              formatActivityDate={formatActivityDate}
              formatTimeAgo={formatTimeAgo}
            />
          </TabsContent>
        </Tabs>
        
        {hasMore && !loading && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={loadMore}
              className="w-full sm:w-auto"
            >
              Load More Activities
            </Button>
          </div>
        )}
        
        {loading && page > 1 && (
          <div className="mt-4 text-center py-4">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
            <p className="text-sm text-gray-500 mt-2">Loading more activities...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ActivityList = ({ 
  activities, 
  loading, 
  getActivityIcon, 
  formatActivityDate,
  formatTimeAgo
}: { 
  activities: UserActivity[]; 
  loading: boolean; 
  getActivityIcon: (type: string) => React.ReactNode;
  formatActivityDate: (date: string) => string;
  formatTimeAgo: (date: string) => string;
}) => {
  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="text-sm text-gray-500 mt-4">Loading activities...</p>
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="py-8 text-center border rounded-md bg-gray-50">
        <Clock className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-600">No activities found</p>
        <p className="text-xs text-gray-500">Activities will appear here when the user performs actions.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="border-b border-gray-100 pb-3 last:border-0">
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">
              {getActivityIcon(activity.entity_type)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {activity.action}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activity.details?.message || `${activity.entity_type} ${activity.entity_id}`}
              </p>
              <div className="flex items-center text-xs text-gray-400 mt-1">
                <span title={formatActivityDate(activity.created_at)}>
                  {formatTimeAgo(activity.created_at)}
                </span>
                {activity.entity_id && activity.entity_type && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="text-gray-400">
                      {activity.entity_type === 'user' ? 'User' : activity.entity_type}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserActivityPanel;
