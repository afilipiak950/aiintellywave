
import React, { useState, useEffect } from 'react';
import { Clock, User, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth';

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

const ActivityTabContent = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        // Get all activities, joined with company_users to get user info
        const { data, error } = await supabase
          .from('user_activities')
          .select(`
            *,
            company_users!user_activities_user_id_fkey(full_name, email)
          `)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (error) throw error;
        
        // Format activities with user info
        const formattedActivities = data.map(activity => ({
          ...activity,
          full_name: activity.company_users?.full_name || 'Unknown User',
          email: activity.company_users?.email || ''
        }));
        
        setActivities(formattedActivities);
      } catch (err: any) {
        console.error('Error fetching activities:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
    
    // Set up real-time subscription to user activities
    const activitiesChannel = supabase.channel('public:user-activities')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_activities' }, () => {
        console.log('New activity detected, refreshing activities');
        fetchActivities();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(activitiesChannel);
    };
  }, []);
  
  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case 'project':
        return <Activity className="h-5 w-5 text-blue-500" />;
      case 'lead':
        return <User className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-start space-x-4 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="border rounded-md p-4 bg-red-50 text-red-800">
          <p className="font-medium">Error loading activities</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="border rounded-md p-4 bg-blue-50 text-blue-800">
          <p className="font-medium">No activities yet</p>
          <p className="text-sm mt-1">
            User activities will appear here as users interact with the system.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4">
            <div className="mt-1">
              {getActivityIcon(activity.entity_type)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                <span className="font-semibold">{activity.full_name}</span> {activity.action}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activity.details?.message || `${activity.entity_type} ${activity.entity_id}`}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              {formatTimeAgo(activity.created_at)}
            </div>
          </div>
        ))}
      </div>
      
      {activities.length > 10 && (
        <div className="mt-6 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Load more activities
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityTabContent;
