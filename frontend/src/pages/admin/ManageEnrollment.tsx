import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllCourses,
  getAllStudents,
  getCourseStudents,
  enrollStudents,
  unenrollStudents,
} from "../../services/api";
import { Course, Student, EnrollmentRequest } from "../../types";
import { toast } from "react-hot-toast";
import {
  UserPlusIcon,
  UserMinusIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const ManageEnrollment: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [unenrollModalOpen, setUnenrollModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Manage Enrollment | AttendanceIQ";
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseStudents(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [coursesResponse, studentsResponse] = await Promise.all([
        getAllCourses(),
        getAllStudents(),
      ]);

      setCourses(coursesResponse.data);
      setAllStudents(studentsResponse.data);

      if (coursesResponse.data.length > 0) {
        setSelectedCourse(coursesResponse.data[0].id);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStudents = async (courseId: number) => {
    try {
      const response = await getCourseStudents(courseId);
      setEnrolledStudents(response.data);
    } catch (error) {
      toast.error("Failed to fetch enrolled students");
    }
  };

  const handleEnrollStudents = async () => {
    if (!selectedCourse || selectedStudents.length === 0) {
      toast.error("Please select a course and at least one student");
      return;
    }

    const request: EnrollmentRequest = {
      courseId: selectedCourse,
      studentIds: selectedStudents,
    };

    try {
      await enrollStudents(request);
      toast.success("Students enrolled successfully");
      setEnrollModalOpen(false);
      setSelectedStudents([]);
      fetchCourseStudents(selectedCourse);
    } catch (error) {
      toast.error("Failed to enroll students");
    }
  };

  const handleUnenrollStudents = async () => {
    if (!selectedCourse || selectedStudents.length === 0) {
      toast.error("Please select a course and at least one student");
      return;
    }

    const request: EnrollmentRequest = {
      courseId: selectedCourse,
      studentIds: selectedStudents,
    };

    try {
      await unenrollStudents(request);
      toast.success("Students unenrolled successfully");
      setUnenrollModalOpen(false);
      setSelectedStudents([]);
      fetchCourseStudents(selectedCourse);
    } catch (error) {
      toast.error("Failed to unenroll students");
    }
  };

  const toggleStudentSelection = (studentId: number) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const getNotEnrolledStudents = () => {
    const enrolledIds = enrolledStudents.map((student) => student.id);
    return allStudents.filter((student) => !enrolledIds.includes(student.id));
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading data...
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
        <h1 className="text-2xl font-semibold">Manage Enrollment</h1>
        <div className="space-x-2">
          <button
            onClick={() => setEnrollModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
            disabled={!selectedCourse}
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Enroll Students
          </button>
          <button
            onClick={() => setUnenrollModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center"
            disabled={!selectedCourse}
          >
            <UserMinusIcon className="h-5 w-5 mr-2" />
            Unenroll Students
          </button>
        </div>
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

      {!selectedCourse ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">
            Please select a course to manage enrollment
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Students Enrolled in {selectedCourseName}
            </h2>
          </div>
          {enrolledStudents.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">
                No students enrolled in this course
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {enrolledStudents.map((student) => (
                <li key={student.id} className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {student.rollNo} • {student.email}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Enroll Students Modal */}
      {enrollModalOpen && (
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
                  Enroll Students in {selectedCourseName}
                </h3>

                <div className="max-h-96 overflow-y-auto">
                  {getNotEnrolledStudents().length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      All students are already enrolled in this course
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {getNotEnrolledStudents().map((student) => (
                        <li key={student.id} className="py-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() =>
                                toggleStudentSelection(student.id)
                              }
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {student.rollNo} • {student.email}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    onClick={() => {
                      setEnrollModalOpen(false);
                      setSelectedStudents([]);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                    onClick={handleEnrollStudents}
                    disabled={selectedStudents.length === 0}
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Enroll Selected
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unenroll Students Modal */}
      {unenrollModalOpen && (
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
                  Unenroll Students from {selectedCourseName}
                </h3>

                <div className="max-h-96 overflow-y-auto">
                  {enrolledStudents.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No students are enrolled in this course
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {enrolledStudents.map((student) => (
                        <li key={student.id} className="py-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() =>
                                toggleStudentSelection(student.id)
                              }
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {student.rollNo} • {student.email}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    onClick={() => {
                      setUnenrollModalOpen(false);
                      setSelectedStudents([]);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                    onClick={handleUnenrollStudents}
                    disabled={selectedStudents.length === 0}
                  >
                    <UserMinusIcon className="h-5 w-5 mr-2" />
                    Unenroll Selected
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

export default ManageEnrollment;
