import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { Notification } from '@/services/types/settingsTypes';

export type { Notification };

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
      let successfulFetch = false;
      
      try {
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
          const typedNotifications = data.map(notification => ({
            id: notification.id,
            user_id: notification.user_id,
            title: notification.title,
            message: notification.message,
            type: notification.type as 'info' | 'success' | 'warning' | 'error',
            created_at: notification.created_at,
            related_to: notification.related_to,
            is_read: !!notification.read_at,
            read_at: notification.read_at
          })) as Notification[];
          
          setNotifications(typedNotifications);
          const unread = typedNotifications.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (directError) {
        console.error('Direct fetch of notifications failed:', directError);
      }
      
      if (!successfulFetch) {
        try {
          const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('get-user-notifications', {
            body: { userId: user.id }
          });
          
          if (edgeFunctionError) {
            throw edgeFunctionError;
          }
          
          if (edgeFunctionData && Array.isArray(edgeFunctionData.notifications)) {
            const typedNotifications = edgeFunctionData.notifications.map(notification => ({
              id: notification.id,
              user_id: notification.user_id,
              title: notification.title,
              message: notification.message,
              type: notification.type as 'info' | 'success' | 'warning' | 'error',
              created_at: notification.created_at,
              related_to: notification.related_to,
              is_read: !!notification.read_at,
              read_at: notification.read_at
            })) as Notification[];
            
            setNotifications(typedNotifications);
            const unread = typedNotifications.filter(n => !n.is_read).length;
            setUnreadCount(unread);
            successfulFetch = true;
          }
        } catch (edgeError) {
          console.error('Edge function fetch of notifications failed:', edgeError);
          throw edgeError;
        }
      }
      
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
        
        const { error: edgeFunctionError } = await supabase.functions.invoke('mark-notification-read', {
          body: { notificationId: id, userId: user.id }
        });
        
        if (edgeFunctionError) {
          throw edgeFunctionError;
        }
      }

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id 
            ? { ...notification, is_read: true, read_at: now } 
            : notification
        )
      );
      
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
        
        const { error: edgeFunctionError } = await supabase.functions.invoke('mark-all-notifications-read', {
          body: { userId: user.id }
        });
        
        if (edgeFunctionError) {
          throw edgeFunctionError;
        }
      }

      setNotifications(prevNotifications =>
        prevNotifications.map(notification => 
          !notification.is_read ? { ...notification, is_read: true, read_at: now } : notification
        )
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    } finally {
      setLoading(false);
    }
  }, [user, notifications, unreadCount]);

  const createProjectNotification = async (userId: string, projectId: string, projectName: string) => {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Project Assignment',
        message: `You have been assigned to project: ${projectName}`,
        type: 'info',
        related_to: projectId,
        is_read: false
      });
    } catch (error) {
      console.error('Failed to create project notification:', error);
    }
  };

  const createLeadNotification = async (
    userId: string,
    leadId: string,
    leadName: string,
    projectId?: string,
    projectName?: string
  ) => {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'New Lead',
        message: projectName 
          ? `New lead "${leadName}" added to project "${projectName}"`
          : `New lead "${leadName}" has been created`,
        type: 'info',
        related_to: leadId,
        is_read: false
      });
    } catch (error) {
      console.error('Failed to create lead notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createProjectNotification,
    createLeadNotification
  };
};
