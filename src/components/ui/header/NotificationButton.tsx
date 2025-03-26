
import { Bell } from 'lucide-react';

const NotificationButton = () => {
  return (
    <button className="p-2 rounded-full hover:bg-gray-100 relative">
      <Bell className="h-5 w-5 text-gray-600" />
      <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
    </button>
  );
};

export default NotificationButton;
