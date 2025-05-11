import React, { useState, useEffect, useRef } from "react";
import {
  getAllCourses,
  getCourseSessions,
  createClassSession,
  saveAttendance,
  getSessionAttendance,
  getCourseStudents,
  deleteSession,
} from "../../services/api";
import { Course, ClassSession, AttendanceRecord, Student } from "../../types";
import { toast } from "react-hot-toast";
import { PlusIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ManageSessions: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    location: "",
  });
  const { user } = useAuth();
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceSessionId, setAttendanceSessionId] = useState<number | null>(
    null
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const navigate = useNavigate();
  const dateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Manage Sessions | AttendanceIQ";
    if (isModalOpen) dateRef.current?.focus();
  }, [isModalOpen]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchSessions(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await getAllCourses();
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0].id);
      }
    } catch (error) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (courseId: number) => {
    setLoading(true);
    try {
      const response = await getCourseSessions(courseId);
      setSessions(response.data);
    } catch (error) {
      toast.error("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    try {
      await createClassSession(selectedCourse, {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
      });

      toast.success("Class session created successfully");
      setIsModalOpen(false);
      setFormData({
        date: "",
        startTime: "",
        endTime: "",
        location: "",
      });

      fetchSessions(selectedCourse);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create class session"
      );
    }
  };

  const fetchStudentsForAttendance = async (
    courseId: number,
    sessionId: number
  ) => {
    try {
      const response = await getCourseStudents(courseId);
      setStudents(response.data);
      const attendanceResp = await getSessionAttendance(sessionId);

      // Build a map of studentId -> record
      const recordMap = new Map<number, AttendanceRecord>();
      attendanceResp.data.forEach((r) => recordMap.set(r.studentId, r));

      // For every student, ensure there is a record (default PRESENT if missing)
      const fullRecords: AttendanceRecord[] = response.data.map((student) => {
        return (
          recordMap.get(student.id) || {
            id: 0,
            sessionId,
            studentId: student.id,
            status: "PRESENT",
            timestamp: new Date().toISOString(),
            markedById: user?.id || 0,
          }
        );
      });

      setAttendanceRecords(fullRecords);
    } catch (error) {
      toast.error("Failed to fetch students or attendance");
    }
  };

  const openAttendanceModal = (courseId: number, sessionId: number) => {
    fetchStudentsForAttendance(courseId, sessionId);
    setAttendanceSessionId(sessionId);
    setAttendanceModalOpen(true);
  };

  const handleAttendanceChange = (studentId: number, status: string) => {
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.studentId === studentId
          ? { ...r, status: status as AttendanceRecord["status"] }
          : r
      )
    );
  };

  const handleSaveAttendance = async () => {
    try {
      // Always send all attendance records for all students
      await saveAttendance(attendanceSessionId!, attendanceRecords);
      toast.success("Attendance saved successfully");
      setAttendanceModalOpen(false);
    } catch (error) {
      toast.error("Failed to save attendance");
    }
  };

  const handleDeleteSession = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;
    try {
      await deleteSession(id);
      toast.success("Session deleted successfully");
      if (selectedCourse) fetchSessions(selectedCourse);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete session");
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading courses...
      </div>
    );
  }

  const selectedCourseName =
    courses.find((c) => c.id === selectedCourse)?.name || "Select a course";

  return (
    <div className="container mx-auto px-4 py-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
      >
        &larr; Back
      </button>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manage Class Sessions</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center"
          disabled={!selectedCourse}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Session
        </button>
      </div>

      <div className="mb-6">
        <label
          htmlFor="course-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Course
        </label>
        <select
          id="course-select"
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={selectedCourse || ""}
          onChange={(e) => setSelectedCourse(parseInt(e.target.value))}
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.code})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          Loading sessions...
        </div>
      ) : !selectedCourse ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">
            Please select a course to view its sessions
          </p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No sessions found for this course</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Sessions for {selectedCourseName}
            </h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <li key={session.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarIcon className="h-6 w-6 text-indigo-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(session.date), "MMMM dd, yyyy")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.startTime} - {session.endTime} at{" "}
                        {session.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      className="ml-4 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      onClick={() =>
                        openAttendanceModal(selectedCourse!, session.id)
                      }
                    >
                      Mark Attendance
                    </button>
                    <button
                      className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Create New Session for {selectedCourseName}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      id="date"
                      ref={dateRef}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="startTime"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        id="startTime"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="endTime"
                        className="block text-sm font-medium text-gray-700"
                      >
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        id="endTime"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="Building and Room Number"
                    />
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {attendanceModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Mark Attendance
                </h3>
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                          Name
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                          Roll No
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const record = attendanceRecords.find(
                          (r) => r.studentId === student.id
                        );
                        return (
                          <tr key={student.id}>
                            <td className="px-2 py-1">
                              {student.firstName} {student.lastName}
                            </td>
                            <td className="px-2 py-1">{student.rollNo}</td>
                            <td className="px-2 py-1">
                              <select
                                value={record?.status || "PRESENT"}
                                onChange={(e) =>
                                  handleAttendanceChange(
                                    student.id,
                                    e.target.value
                                  )
                                }
                                className="border rounded px-2 py-1"
                              >
                                <option value="PRESENT">Present</option>
                                <option value="ABSENT">Absent</option>
                                <option value="LATE">Late</option>
                                <option value="EXCUSED">Excused</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded"
                    onClick={() => setAttendanceModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                    onClick={handleSaveAttendance}
                  >
                    Save Attendance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSessions;
