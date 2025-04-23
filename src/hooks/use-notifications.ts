
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

// Define notification type
export interface Notification {
  id: string;
  user_id: string;
  message: string;
  read_at?: string | null;
  is_read: boolean;
  created_at: string;
  type?: string;
  link?: string;
  title?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // First try direct fetch with error handling
      let successfulFetch = false;
      
      try {
        // Use a simple query with timeout for better error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)
          .abortSignal(controller.signal);
          
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Error fetching notifications:', error);
          throw error;
        }

        if (data) {
          successfulFetch = true;
          const notificationsWithReadStatus = data.map(notification => ({
            ...notification,
            is_read: !!notification.read_at
          }));
          
          setNotifications(notificationsWithReadStatus);
          
          // Count unread notifications
          const unread = notificationsWithReadStatus.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (directError) {
        console.error('Direct fetch of notifications failed:', directError);
        // No need to throw here, we'll try the edge function
      }
      
      // If direct fetch failed, try edge function
      if (!successfulFetch) {
        try {
          const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('get-user-notifications', {
            body: { userId: user.id }
          });
          
          if (edgeFunctionError) {
            throw edgeFunctionError;
          }
          
          if (edgeFunctionData && Array.isArray(edgeFunctionData.notifications)) {
            // Process notifications
            const notificationsWithReadStatus = edgeFunctionData.notifications.map(notification => ({
              ...notification,
              is_read: !!notification.read_at
            }));
            
            setNotifications(notificationsWithReadStatus);
            
            // Count unread notifications
            const unread = notificationsWithReadStatus.filter(n => !n.is_read).length;
            setUnreadCount(unread);
            
            successfulFetch = true;
          }
        } catch (edgeError) {
          console.error('Edge function fetch of notifications failed:', edgeError);
          throw edgeError; // Re-throw for the outer catch block
        }
      }
      
      // If all attempts failed
      if (!successfulFetch) {
        throw new Error('Failed to fetch notifications through available methods');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const now = new Date().toISOString();
      
      // First try direct update
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read_at: now })
          .eq('id', id)
          .eq('user_id', user.id);
          
        if (error) {
          throw error;
        }
      } catch (directError) {
        console.error('Direct mark as read failed:', directError);
        
        // Try edge function as fallback
        const { error: edgeFunctionError } = await supabase.functions.invoke('mark-notification-read', {
          body: { notificationId: id, userId: user.id }
        });
        
        if (edgeFunctionError) {
          throw edgeFunctionError;
        }
      }

      // Update local state regardless of method used
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id ? { ...notification, read_at: now, is_read: true } : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user || unreadCount === 0) return;
    
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return;
      
      // Try direct update first
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read_at: now })
          .in('id', unreadIds)
          .eq('user_id', user.id);
          
        if (error) {
          throw error;
        }
      } catch (directError) {
        console.error('Direct mark all as read failed:', directError);
        
        // Try edge function as fallback
        const { error: edgeFunctionError } = await supabase.functions.invoke('mark-all-notifications-read', {
          body: { userId: user.id }
        });
        
        if (edgeFunctionError) {
          throw edgeFunctionError;
        }
      }

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => 
          !notification.is_read ? { ...notification, read_at: now, is_read: true } : notification
        )
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    } finally {
      setLoading(false);
    }
  }, [user, notifications, unreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};
