import axios from "axios";
import {
  User,
  Student,
  Course,
  ClassSession,
  AdminRegistrationData,
  StudentRegistrationData,
  InstructorRegistrationData,
  CourseRegistrationData,
  EnrollmentRequest,
  ClassSessionData,
  AttendanceRecord,
} from "../types";

// Remove API_URL and use relative URLs for proxy to work

// Set default axios configurations
axios.defaults.baseURL = "/api"; // Ensure all requests are prefixed with /api
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";

// Auth endpoints
export const loginUser = (email: string, password: string) =>
  axios
    .post(`/auth/login`, { email, password })
    .then((response) => {
      console.log("Login successful:", response.data);
      return response;
    })
    .catch((error) => {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    });

export const loginAdmin = (email: string, password: string) =>
  axios.post(`/auth/login`, { email, password });

export const loginInstructor = (email: string, password: string) =>
  axios.post(`/auth/login/instructor`, { email, password });

export const registerAdmin = (data: AdminRegistrationData) =>
  axios
    .post("/auth/register/admin", data) // Remove extra /api prefix
    .then((response) => {
      console.log("Registration response:", response);
      return response;
    })
    .catch((error) => {
      console.error("Registration error:", error.response || error);
      throw error;
    });

export const resetPassword = (email: string) =>
  axios.post(`/auth/reset-password`, { email });

// Admin endpoints
export const registerStudent = (data: StudentRegistrationData) =>
  axios.post(`/admin/students`, data);

export const registerInstructor = (data: InstructorRegistrationData) =>
  axios.post(`/admin/instructors`, data);

export const createCourse = (data: CourseRegistrationData) =>
  axios.post(`/admin/courses`, data);

export const createClassSession = (courseId: number, data: ClassSessionData) =>
  axios.post(`/admin/courses/${courseId}/sessions`, data);

export const enrollStudents = (data: EnrollmentRequest) =>
  axios.post(`/admin/enrollment`, data);

export const unenrollStudents = (data: EnrollmentRequest) =>
  axios.post(`/admin/unenrollment`, data);

export const getAllStudents = () => axios.get<Student[]>(`/admin/students`);

export const getAllInstructors = () => axios.get<User[]>(`/admin/instructors`);

export const getAllCourses = () => axios.get<Course[]>(`/admin/courses`);

export const deleteStudent = (id: number) =>
  axios.delete(`/admin/students/${id}`);

export const deleteInstructor = (id: number) =>
  axios.delete(`/admin/instructors/${id}`);

export const deleteCourse = (id: number) =>
  axios.delete(`/admin/courses/${id}`);

export const deleteSession = (id: number) =>
  axios.delete(`/admin/sessions/${id}`);

// Course endpoints
export const getInstructorCourses = () =>
  axios.get<Course[]>(`/courses/instructor`);

export const getCourseStudents = (courseId: number) =>
  axios.get<Student[]>(`/courses/${courseId}/students`);

// Session endpoints
export const getCourseSessions = (courseId: number) =>
  axios.get<ClassSession[]>(`/courses/${courseId}/sessions`);

export const getSessionById = (sessionId: number) =>
  axios.get<ClassSession>(`/sessions/${sessionId}`);

export const getSessionAttendance = (sessionId: number) =>
  axios.get<AttendanceRecord[]>(`/sessions/${sessionId}/attendance`);

export const saveAttendance = (
  sessionId: number,
  records: AttendanceRecord[]
) => axios.post(`/sessions/${sessionId}/attendance`, { records });

// User endpoints
export const getCurrentUser = () => axios.get<User>(`/users/me`);

export const updateUserProfile = (data: {
  firstName: string;
  lastName: string;
  email: string;
}) => axios.put<User>(`/users/profile`, data);

// Notification endpoints
export const getNotifications = () => axios.get(`/notifications`);

export const getUnreadNotifications = () => axios.get(`/notifications/unread`);

export const getUnreadCount = () => axios.get<number>(`/notifications/count`);

export const markNotificationAsRead = (id: number) =>
  axios.put(`/notifications/${id}/read`);

// Student attendance
export const getStudentAttendanceSummary = () =>
  axios.get(`/attendance/student/summary`);
