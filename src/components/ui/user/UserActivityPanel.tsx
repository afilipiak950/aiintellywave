
import React, { useState, useEffect } from 'react';
import { Clock, User, Activity, Folder, FileText, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

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
  
  const pageSize = 15;
  
  useEffect(() => {
    fetchUserActivities();
  }, [userId, page, filter]);
  
  const fetchUserActivities = async () => {
    try {
      setLoading(true);
      
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
      
      if (error) throw error;
      
      if (!data) {
        setActivities([]);
        return;
      }
      
      // Fix: Cast data with type assertion to avoid typescript error
      const typedData = data as unknown as UserActivity[];
      setActivities(prev => page === 1 ? typedData : [...prev, ...typedData]);
      setHasMore(data.length === pageSize);
    } catch (err: any) {
      console.error('Error fetching user activities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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
  
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };
  
  const handleFilterChange = (value: string) => {
    setFilter(value === 'all' ? null : value);
    setPage(1);
  };
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-md">
        <p className="font-medium text-red-800">Error loading user activities</p>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">User Activity History</h3>
        <p className="text-sm text-gray-500 mt-1">
          Track all actions performed by this user
        </p>
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
              loading={loading} 
              getActivityIcon={getActivityIcon} 
              formatActivityDate={formatActivityDate}
            />
          </TabsContent>
          
          <TabsContent value="project" className="mt-0">
            <ActivityList 
              activities={activities} 
              loading={loading} 
              getActivityIcon={getActivityIcon} 
              formatActivityDate={formatActivityDate}
            />
          </TabsContent>
          
          <TabsContent value="lead" className="mt-0">
            <ActivityList 
              activities={activities} 
              loading={loading} 
              getActivityIcon={getActivityIcon} 
              formatActivityDate={formatActivityDate}
            />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <ActivityList 
              activities={activities} 
              loading={loading} 
              getActivityIcon={getActivityIcon} 
              formatActivityDate={formatActivityDate}
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
  formatActivityDate 
}: { 
  activities: UserActivity[]; 
  loading: boolean; 
  getActivityIcon: (type: string) => React.ReactNode;
  formatActivityDate: (date: string) => string;
}) => {
  if (loading && activities.length === 0) {
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
              <p className="text-xs text-gray-400 mt-1">
                {formatActivityDate(activity.created_at)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserActivityPanel;
