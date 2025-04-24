
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationsPanel from '../notifications/NotificationsPanel';
import { useNotifications } from '../../../hooks/use-notifications';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NotificationButtonProps {
  className?: string;
}

const NotificationButton = ({ className }: NotificationButtonProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount, fetchNotifications, error } = useNotifications();
  const { toast } = useToast();
  
  // Refresh notifications when the component mounts
  useEffect(() => {
    // Use immediate try-catch to handle any potential promise rejections
    const loadNotifications = async () => {
      try {
        await fetchNotifications();
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    
    loadNotifications();
    
    // Set up polling for notifications every minute (increased from 30s to reduce load)
    const interval = setInterval(() => {
      loadNotifications();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);
  
  // Show error toast only once when error occurs
  useEffect(() => {
    if (error) {
      console.error('Notification error:', error);
    }
  }, [error, toast]);
  
  return (
    <div className="relative">
      <button 
        className={cn("p-2.5 rounded-full hover:bg-gray-100 relative", className)}
        onClick={() => setShowNotifications(!showNotifications)}
        title={error ? "Failed to load notifications" : "Notifications"}
      >
        <Bell className={`h-5 w-5 ${error ? 'text-gray-400' : 'text-gray-600'}`} />
        {!error && unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center bg-red-500 rounded-full text-[10px] text-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {showNotifications && !error && (
        <NotificationsPanel 
          onClose={() => setShowNotifications(false)} 
        />
      )}
      
      {showNotifications && error && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 p-4 z-50">
          <p className="text-sm text-red-500">Failed to load notifications. Please try again.</p>
          <button 
            className="mt-2 text-xs text-blue-500 hover:text-blue-700"
            onClick={() => {
              fetchNotifications();
              setShowNotifications(false);
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
