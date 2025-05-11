import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AcademicCapIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { getInstructorCourses } from "../../services/api";
import { Course } from "../../types";
import toast from "react-hot-toast";

const InstructorDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Instructor Dashboard | AttendanceIQ";
    const fetchCourses = async () => {
      try {
        // Use the API helper for instructor courses
        const response = await getInstructorCourses();
        setCourses(response.data);
      } catch (error) {
        toast.error("Failed to fetch your courses");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm mb-4"
        >
          &larr; Back to Dashboard
        </button>
      </div>
      <div className="mb-8 flex flex-col items-center">
        <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 p-4 mb-4">
          <AcademicCapIcon className="h-10 w-10 text-indigo-600" />
        </span>
        <h1 className="text-3xl font-bold text-indigo-800 mb-2 text-center">
          Welcome, Instructor!
        </h1>
        <p className="text-gray-600 text-center max-w-xl">
          Here you can view your assigned courses, manage sessions, and mark
          attendance for your students.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">
            You are not assigned to any courses.
          </p>
          <p className="text-gray-400 mt-2">
            Contact your admin if you believe this is a mistake.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-gradient-to-br from-indigo-50 via-white to-blue-100 shadow-lg rounded-2xl p-6 flex flex-col border border-indigo-100 hover:shadow-xl transition"
            >
              <div className="flex items-center mb-3">
                <AcademicCapIcon className="h-7 w-7 text-indigo-600 mr-3" />
                <h2 className="text-xl font-bold text-indigo-700">
                  {course.name}{" "}
                  <span className="text-gray-500 font-normal">
                    ({course.code})
                  </span>
                </h2>
              </div>
              <div className="flex flex-col gap-1 mb-4">
                <span className="text-sm text-gray-600">
                  <span className="font-medium">Semester:</span>{" "}
                  {course.semester || "N/A"}
                </span>
                <span className="text-sm text-gray-600">
                  <span className="font-medium">Department:</span>{" "}
                  {course.department || "N/A"}
                </span>
              </div>
              <Link
                to={`/dashboard/instructor/attendance?courseId=${course.id}`}
                className="mt-auto inline-flex items-center justify-center bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                <ClipboardIcon className="h-5 w-5 mr-2" />
                Manage Attendance
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
