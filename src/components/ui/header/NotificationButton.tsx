
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationsPanel from '../notifications/NotificationsPanel';
import { useNotifications } from '../../../hooks/use-notifications';

const NotificationButton = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount, fetchNotifications } = useNotifications();
  
  // Refresh notifications when the component mounts
  useEffect(() => {
    fetchNotifications();
    // Set up polling for notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);
  
  return (
    <div className="relative">
      <button 
        className="p-2.5 rounded-full hover:bg-gray-100 relative"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center bg-red-500 rounded-full text-[10px] text-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <NotificationsPanel 
          onClose={() => setShowNotifications(false)} 
        />
      )}
    </div>
  );
};

export default NotificationButton;
