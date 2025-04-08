import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'wouter';

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  date: string;
  type: 'booking' | 'review' | 'system';
  link?: string;
}

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock data for notifications
  const notifications: Notification[] = [
    {
      id: 1,
      title: "Booking Confirmed",
      message: "Your booking for Electrician service has been confirmed.",
      read: false,
      date: "10 mins ago",
      type: "booking",
      link: "/dashboard/bookings"
    },
    {
      id: 2,
      title: "New Provider Available",
      message: "New plumbers are now available in your area.",
      read: false,
      date: "1 hour ago",
      type: "system",
      link: "/dashboard/services"
    },
    {
      id: 3,
      title: "Leave a Review",
      message: "Please rate your recent Painting service experience.",
      read: true,
      date: "Yesterday",
      type: "review",
      link: "/dashboard/reviews"
    },
    {
      id: 4,
      title: "Special Offer",
      message: "Limited time discount on Gardening services.",
      read: true,
      date: "2 days ago",
      type: "system"
    }
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: number) => {
    // API call to mark notification as read would go here
    console.log(`Marked notification ${id} as read`);
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <div className="p-2 bg-blue-100 rounded-full"><Bell className="h-4 w-4 text-blue-600" /></div>;
      case 'review':
        return <div className="p-2 bg-amber-100 rounded-full"><Bell className="h-4 w-4 text-amber-600" /></div>;
      case 'system':
        return <div className="p-2 bg-purple-100 rounded-full"><Bell className="h-4 w-4 text-purple-600" /></div>;
      default:
        return <div className="p-2 bg-gray-100 rounded-full"><Bell className="h-4 w-4 text-gray-600" /></div>;
    }
  };
  
  return (
    <div className="relative">
      <button 
        className="p-2 rounded-full hover:bg-gray-100 transition-all relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-6 w-6 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-30">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  className="text-xs text-primary hover:underline"
                  onClick={() => console.log('Mark all as read')}
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 transition-all ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start">
                    {getNotificationIcon(notification.type)}
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-primary' : 'text-gray-800'}`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-500 ml-2">{notification.date}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                      <div className="flex justify-between items-center mt-2">
                        {notification.link ? (
                          <Link 
                            href={notification.link} 
                            className="text-xs text-primary hover:underline"
                            onClick={() => markAsRead(notification.id)}
                          >
                            View details
                          </Link>
                        ) : (
                          <span></span>
                        )}
                        
                        {!notification.read && (
                          <button 
                            className="text-xs text-gray-500 hover:text-gray-700"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No notifications</p>
              </div>
            )}
          </div>
          
          <div className="p-3 text-center border-t border-gray-100">
            <Link href="/dashboard/settings/notifications" className="text-xs text-primary hover:underline">
              Notification Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;