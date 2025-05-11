import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getAllStudents,
  getAllInstructors,
  getAllCourses,
} from "../../services/api";
import { toast } from "react-hot-toast";
import {
  UsersIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    students: 0,
    instructors: 0,
    courses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin Dashboard | AttendanceIQ";
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [studentsResponse, instructorsResponse, coursesResponse] =
        await Promise.all([
          getAllStudents(),
          getAllInstructors(),
          getAllCourses(),
        ]);

      setStats({
        students: studentsResponse.data.length,
        instructors: instructorsResponse.data.length,
        courses: coursesResponse.data.length,
      });
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  const cards = [
    {
      title: "Students",
      count: stats.students,
      icon: <UsersIcon className="h-6 w-6" />,
      color: "bg-blue-500",
      link: "/admin/students",
    },
    {
      title: "Instructors",
      count: stats.instructors,
      icon: <UserGroupIcon className="h-6 w-6" />,
      color: "bg-green-500",
      link: "/admin/instructors",
    },
    {
      title: "Courses",
      count: stats.courses,
      icon: <AcademicCapIcon className="h-6 w-6" />,
      color: "bg-purple-500",
      link: "/admin/courses",
    },
  ];

  const quickLinks = [
    {
      title: "Manage Students",
      description: "Register new students and manage existing ones",
      icon: <UsersIcon className="h-6 w-6" />,
      link: "/admin/students",
    },
    {
      title: "Manage Instructors",
      description: "Add and manage course instructors",
      icon: <UserGroupIcon className="h-6 w-6" />,
      link: "/admin/instructors",
    },
    {
      title: "Manage Courses",
      description: "Create and configure courses",
      icon: <AcademicCapIcon className="h-6 w-6" />,
      link: "/admin/courses",
    },
    {
      title: "Manage Class Sessions",
      description: "Schedule and manage class sessions",
      icon: <CalendarIcon className="h-6 w-6" />,
      link: "/admin/sessions",
    },
    {
      title: "Manage Enrollment",
      description: "Enroll and unenroll students from courses",
      icon: <ClipboardDocumentListIcon className="h-6 w-6" />,
      link: "/admin/enrollment",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <Link
            to={card.link}
            key={index}
            className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-md"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 rounded-md p-3 ${card.color} text-white`}
                >
                  {card.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {card.count}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Access common management functions
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-6">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.link}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 text-indigo-600">{link.icon}</div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-900">
                  {link.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
