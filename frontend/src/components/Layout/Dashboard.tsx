// File: src/components/Layout/Dashboard.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserIcon, AcademicCapIcon, ClipboardIcon, CogIcon, ArrowLeftOnRectangleIcon, BellIcon } from '@heroicons/react/24/outline';
import NotificationPopover from '../Notification/NotificationPopover';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-indigo-600">
              AttendanceIQ
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationPopover />
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold">
                {user?.firstName?.charAt(0) || ''}{user?.lastName?.charAt(0) || ''}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.firstName} {user?.lastName}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow mr-6 p-4">
          <nav className="space-y-1">
            <Link to="/dashboard" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600">
              <AcademicCapIcon className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
            
            {user?.role === 'INSTRUCTOR' && (
              <Link to="/attendance" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600">
                <ClipboardIcon className="h-5 w-5 mr-3" />
                Attendance
              </Link>
            )}
            
            {user?.role === 'STUDENT' && (
              <Link to="/my-attendance" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600">
                <ClipboardIcon className="h-5 w-5 mr-3" />
                My Attendance
              </Link>
            )}
            
            {user?.role === 'ADMIN' && (
              <Link to="/reports" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600">
                <CogIcon className="h-5 w-5 mr-3" />
                Reports
              </Link>
            )}
            
            <Link to="/notifications" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600">
              <BellIcon className="h-5 w-5 mr-3" />
              Notifications
            </Link>
            
            <Link to="/profile" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600">
              <UserIcon className="h-5 w-5 mr-3" />
              Profile
            </Link>
            
            <button 
              onClick={logout} 
              className="w-full flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
              Logout
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-white shadow rounded-lg p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;