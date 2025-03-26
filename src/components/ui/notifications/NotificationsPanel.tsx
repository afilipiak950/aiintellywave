
import { useMemo } from 'react';
import { Check, X, Bell } from 'lucide-react';
import { useNotifications } from '../../../hooks/use-notifications';
import { Notification } from '@/services/types/settingsTypes';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';
import { ScrollArea } from '../scroll-area';

interface NotificationsPanelProps {
  onClose: () => void;
}

const NotificationsPanel = ({ onClose }: NotificationsPanelProps) => {
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  const unreadNotifications = useMemo(() => 
    notifications.filter(n => !n.is_read),
    [notifications]
  );
  
  const readNotifications = useMemo(() => 
    notifications.filter(n => n.is_read),
    [notifications]
  );

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 animate-scale-in origin-top-right">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <div className="flex space-x-2">
          {unreadNotifications.length > 0 && (
            <Button 
              onClick={markAllAsRead} 
              variant="outline" 
              size="sm" 
              className="text-xs"
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Mark all as read
            </Button>
          )}
          <Button 
            onClick={onClose}
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="unread" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="unread" className="text-sm">
            Unread ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="read" className="text-sm">
            Read ({readNotifications.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="unread">
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : unreadNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500">No unread notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {unreadNotifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onMarkAsRead={markAsRead} 
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="read">
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : readNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500">No read notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {readNotifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onMarkAsRead={markAsRead} 
                    isRead
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  isRead?: boolean;
}

const NotificationItem = ({ notification, onMarkAsRead, isRead = false }: NotificationItemProps) => {
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  const typeStyles = getTypeStyles();
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
  
  return (
    <div className={`p-4 hover:bg-gray-50 ${!isRead ? 'bg-gray-50' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeStyles}`}>
              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
            </span>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
          <h4 className="text-sm font-medium">{notification.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        </div>
        
        {!isRead && (
          <Button 
            onClick={() => onMarkAsRead(notification.id)} 
            size="sm" 
            variant="ghost" 
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-500"
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
