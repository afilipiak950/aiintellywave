
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { toast } from './use-toast';
import { Notification } from '@/services/types/settingsTypes';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch user notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      
      if (data) {
        // Map database records to the Notification type
        const typedNotifications = data.map(item => ({
          ...item,
          type: mapNotificationType(item.type)
        })) as Notification[];
        
        setNotifications(typedNotifications);
        setUnreadCount(typedNotifications.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to map any string to our allowed notification types
  const mapNotificationType = (type: string): Notification['type'] => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info'; // Default to info for any unrecognized type
    }
  };
  
  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;
    
    try {
      // Update notification in database
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true } 
          : notification
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to update notification. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const markAllAsRead = async () => {
    if (!user?.id || notifications.length === 0) return;
    
    try {
      // Update all notifications in database
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
        variant: "default"
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to update notifications. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      
      // Set up real-time subscription for new notifications
      const channel = supabase
        .channel('public:notifications')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            const newNotification = {
              ...payload.new,
              type: mapNotificationType(payload.new.type)
            } as Notification;
            
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast for new notification
            toast({
              title: newNotification.title,
              description: newNotification.message,
              variant: newNotification.type === 'error' ? 'destructive' : 'default'
            });
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);
  
  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};

export type { Notification };
