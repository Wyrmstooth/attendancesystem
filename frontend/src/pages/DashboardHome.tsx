import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  AcademicCapIcon,
  ClipboardIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

type AttendanceSummary = {
  courseId: number;
  courseName: string;
  courseCode: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
};

type Notification = {
  id: number;
  message: string;
  timestamp: string;
  read: boolean;
  type: string;
};

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dashboard | AttendanceIQ";
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Attendance summary
      const attendanceRes = await axios.get("/attendance/student/summary");
      setSummaries(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
      // Notifications (show only 3 latest)
      const notifRes = await axios.get<Notification[]>("/notifications");
      setNotifications(notifRes.data.slice(0, 3));
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Welcome, {user.firstName}!
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <AcademicCapIcon className="h-8 w-8 text-indigo-500 mb-2" />
          <span className="text-lg font-semibold text-indigo-700">Courses</span>
          <span className="text-3xl mt-2">{summaries.length}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <ClipboardIcon className="h-8 w-8 text-green-500 mb-2" />
          <span className="text-lg font-semibold text-green-700">
            Total Sessions
          </span>
          <span className="text-3xl mt-2">
            {summaries.reduce((acc, s) => acc + s.totalSessions, 0)}
          </span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <BellIcon className="h-8 w-8 text-yellow-500 mb-2" />
          <span className="text-lg font-semibold text-yellow-700">
            Unread Notifications
          </span>
          <span className="text-3xl mt-2">
            {notifications.filter((n) => !n.read).length}
          </span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">My Courses</h2>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            Loading...
          </div>
        ) : summaries.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <p className="text-gray-500">
              You are not enrolled in any courses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {summaries.map((summary) => (
              <div
                key={summary.courseId}
                className="bg-white shadow rounded-lg p-4 flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-indigo-700">
                      {summary.courseCode}
                    </span>
                    <span className="ml-2 text-gray-700">
                      {summary.courseName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {summary.totalSessions} sessions
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex flex-col items-center">
                    <span className="text-green-600 font-bold">
                      {summary.presentCount}
                    </span>
                    <span className="text-xs text-gray-500">Present</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-red-600 font-bold">
                      {summary.absentCount}
                    </span>
                    <span className="text-xs text-gray-500">Absent</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-yellow-600 font-bold">
                      {summary.lateCount}
                    </span>
                    <span className="text-xs text-gray-500">Late</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-blue-600 font-bold">
                      {summary.excusedCount}
                    </span>
                    <span className="text-xs text-gray-500">Excused</span>
                  </div>
                  <div className="flex flex-col items-center ml-auto">
                    <span className="text-indigo-700 font-bold">
                      {Number(summary.attendancePercentage).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">Attendance</span>
                  </div>
                </div>
                <button
                  className="mt-4 text-sm text-indigo-600 hover:underline"
                  onClick={() => navigate("/dashboard/my-attendance")}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Recent Notifications</h2>
        {notifications.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <p className="text-gray-500">No notifications yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow">
            {notifications.map((n) => (
              <li key={n.id} className="px-4 py-3 flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    n.read ? "bg-gray-300" : "bg-yellow-400"
                  }`}
                  title={n.read ? "Read" : "Unread"}
                ></span>
                <span className="flex-1 text-gray-700">{n.message}</span>
                <span className="ml-4 text-xs text-gray-400">
                  {new Date(n.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 text-right">
          <button
            className="text-indigo-600 hover:underline text-sm"
            onClick={() => navigate("/dashboard/notifications")}
          >
            View All Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
