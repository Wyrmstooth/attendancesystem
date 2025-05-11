// File: src/types/index.ts
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
}

export interface Student {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  rollNo: string;
  email: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  semester: string;
  department: string;
  instructorId: number;
}

export interface ClassSession {
  id: number;
  courseId: number;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface AttendanceRecord {
  id: number;
  sessionId: number;
  studentId: number;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  timestamp: string;
  markedById: number;
}

export interface AttendanceSummary {
  courseId: number;
  courseName: string;
  courseCode: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  timestamp: string;
  read: boolean;
  type: "ATTENDANCE" | "SYSTEM" | "ALERT";
}

export interface AdminRegistrationData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface StudentRegistrationData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  rollNo: string;
}

export interface InstructorRegistrationData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
}

export interface CourseRegistrationData {
  name: string;
  code: string;
  semester: string;
  department: string;
  instructorId: number;
}

export interface EnrollmentRequest {
  courseId: number;
  studentIds: number[];
}

export interface ClassSessionData {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface QRAttendanceToken {
  sessionId: number;
  token: string;
  expiresAt: string;
}
