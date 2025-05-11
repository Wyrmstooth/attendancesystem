// File: src/components/Notification/NotificationItem.tsx
import React from 'react';
import { Notification } from '../../types';
import { BellAlertIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'attendance':
        return <BellAlertIcon className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'system':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    if (notification.read) return 'bg-white';
    
    switch (notification.type) {
      case 'attendance':
        return 'bg-blue-50';
      case 'alert':
        return 'bg-red-50';
      case 'system':
      default:
        return 'bg-gray-50';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const time = new Date(timeString);
      return formatDistanceToNow(time, { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  return (
    <div className={`px-4 py-3 ${getBgColor()} hover:bg-gray-100 transition-colors duration-150`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-gray-900">{notification.message}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">{formatTime(notification.timestamp)}</p>
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;