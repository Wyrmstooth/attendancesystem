import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AcademicCapIcon,
  UserGroupIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const Home: React.FC = () => {
  useEffect(() => {
    document.title = "AttendanceIQ | Smart Attendance Management";
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 via-white to-blue-100 px-4">
      <div className="max-w-2xl w-full bg-white shadow-xl rounded-2xl p-10 flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 p-4 mb-4">
            <AcademicCapIcon className="h-12 w-12 text-indigo-600" />
          </span>
          <h1 className="text-4xl font-extrabold text-indigo-700 mb-2 text-center">
            Welcome to AttendanceIQ
          </h1>
          <p className="text-lg text-gray-600 text-center">
            Smart attendance management for students, instructors, and admins.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <Link
            to="/login"
            className="flex flex-col items-center bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl p-6 transition group"
          >
            <UserIcon className="h-8 w-8 text-indigo-500 mb-2 group-hover:scale-110 transition" />
            <span className="font-semibold text-indigo-700 text-lg">
              Student Login
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Access your attendance records
            </span>
          </Link>
          <Link
            to="/login/instructor"
            className="flex flex-col items-center bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-6 transition group"
          >
            <UserGroupIcon className="h-8 w-8 text-green-500 mb-2 group-hover:scale-110 transition" />
            <span className="font-semibold text-green-700 text-lg">
              Instructor Login
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Manage courses and mark attendance
            </span>
          </Link>
          <Link
            to="/login/admin"
            className="flex flex-col items-center bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-6 transition group"
          >
            <ShieldCheckIcon className="h-8 w-8 text-blue-500 mb-2 group-hover:scale-110 transition" />
            <span className="font-semibold text-blue-700 text-lg">
              Admin Login
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Full system administration
            </span>
          </Link>
          <Link
            to="/register/admin"
            className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-6 transition group"
          >
            <ShieldCheckIcon className="h-8 w-8 text-gray-700 mb-2 group-hover:scale-110 transition" />
            <span className="font-semibold text-gray-800 text-lg">
              Register as Admin
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Create a new admin account
            </span>
          </Link>
        </div>
        <div className="mt-10 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} AttendanceIQ. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Home;
