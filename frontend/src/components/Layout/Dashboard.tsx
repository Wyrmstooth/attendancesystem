// File: src/components/Layout/Dashboard.tsx
import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  UserIcon,
  AcademicCapIcon,
  ClipboardIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
  ChartBarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import NotificationPopover from "../Notification/NotificationPopover";

const Dashboard: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Prevent rendering until user is loaded
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  // If not authenticated, do not render dashboard (let ProtectedRoute handle redirect)
  if (!user) {
    return null;
  }

  // Sidebar links per role
  const sidebarLinks =
    user.role === "INSTRUCTOR"
      ? [
          {
            to: "/dashboard/instructor",
            label: "Dashboard",
            icon: <AcademicCapIcon className="h-5 w-5 mr-3" />,
          },
          {
            to: "/dashboard/instructor/attendance",
            label: "Attendance",
            icon: <ClipboardIcon className="h-5 w-5 mr-3" />,
          },
          {
            to: "/dashboard/notifications",
            label: "Notifications",
            icon: <BellIcon className="h-5 w-5 mr-3" />,
          },
          {
            to: "/dashboard/profile",
            label: "Profile",
            icon: <UserIcon className="h-5 w-5 mr-3" />,
          },
        ]
      : user.role === "STUDENT"
      ? [
          {
            to: "/dashboard",
            label: "Dashboard",
            icon: <AcademicCapIcon className="h-5 w-5 mr-3" />,
          },
          {
            to: "/dashboard/my-attendance",
            label: "My Attendance",
            icon: <ClipboardIcon className="h-5 w-5 mr-3" />,
          },
          {
            to: "/dashboard/notifications",
            label: "Notifications",
            icon: <BellIcon className="h-5 w-5 mr-3" />,
          },
          {
            to: "/dashboard/profile",
            label: "Profile",
            icon: <UserIcon className="h-5 w-5 mr-3" />,
          },
        ]
      : [];

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
                {user?.firstName?.charAt(0) || ""}
                {user?.lastName?.charAt(0) || ""}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow mr-6 p-4 flex-shrink-0 h-[calc(100vh-5rem)] sticky top-[5rem] self-start">
          {/* 
            - w-64: fixed width
            - flex-shrink-0: don't shrink
            - h-[calc(100vh-5rem)]: fill viewport minus header (adjust if header height changes)
            - sticky top-[5rem]: stick to top after header (adjust if header height changes)
            - self-start: align to top of flex container
          */}
          <nav className="space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {user?.role === "ADMIN" && (
              <>
                <Link
                  to="/admin"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <ChartBarIcon className="h-5 w-5 mr-3" />
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/students"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <UsersIcon className="h-5 w-5 mr-3" />
                  Manage Students
                </Link>
                <Link
                  to="/admin/courses"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <AcademicCapIcon className="h-5 w-5 mr-3" />
                  Manage Courses
                </Link>
                <Link
                  to="/reports"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <CogIcon className="h-5 w-5 mr-3" />
                  Reports
                </Link>
              </>
            )}

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
