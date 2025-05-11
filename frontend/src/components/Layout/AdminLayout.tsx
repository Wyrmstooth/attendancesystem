import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  UsersIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
};

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-2 rounded-md transition-colors ${
          isActive
            ? "bg-indigo-50 text-indigo-600"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        }`
      }
    >
      <div className="mr-3">{icon}</div>
      <span>{label}</span>
    </NavLink>
  );
};

const AdminLayout: React.FC = () => {
  const navItems = [
    {
      to: "/admin",
      icon: <ChartBarIcon className="h-5 w-5" />,
      label: "Dashboard",
    },
    {
      to: "/admin/students",
      icon: <UsersIcon className="h-5 w-5" />,
      label: "Students",
    },
    {
      to: "/admin/instructors",
      icon: <UserGroupIcon className="h-5 w-5" />,
      label: "Instructors",
    },
    {
      to: "/admin/courses",
      icon: <AcademicCapIcon className="h-5 w-5" />,
      label: "Courses",
    },
    {
      to: "/admin/sessions",
      icon: <CalendarIcon className="h-5 w-5" />,
      label: "Sessions",
    },
    {
      to: "/admin/enrollment",
      icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
      label: "Enrollment",
    },
  ];

  return (
    <div className="flex flex-1 min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0 h-screen sticky top-0 self-start">
        {/* 
          - w-64: fixed width
          - flex-shrink-0: don't shrink
          - h-screen: full viewport height
          - sticky top-0: stick to top
          - self-start: align to top of flex container
        */}
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item, index) => (
            <NavItem
              key={index}
              to={item.to}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
