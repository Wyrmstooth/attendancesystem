// File: src/components/Notification/NotificationPopover.tsx
import React, { useState, useEffect, Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import toast from 'react-hot-toast';
import NotificationItem from './NotificationItem';
import { Notification } from '../../types';

const NotificationPopover: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Notification[]>('/notifications');
      setNotifications(response.data);
      const unreadResponse = await axios.get<number>('/notifications/count');
      setUnreadCount(unreadResponse.data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get<number>('/notifications/count');
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(notification => !notification.read)
          .map(notification => axios.put(`/notifications/${notification.id}/read`))
      );
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button className="flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none">
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 max-h-96 overflow-y-auto origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="divide-y divide-gray-200">
                <div className="flex items-center justify-between p-4">
                  <h5 className="text-lg font-medium text-gray-900">Notifications</h5>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="py-2">
                  {loading ? (
                    <div className="flex justify-center items-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500">
                      No notifications yet
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={markAsRead}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default NotificationPopover;