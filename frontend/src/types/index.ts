// File: src/types/index.ts
export type User = {
  id: number;
  username: string;
  email: string;
  role: 'student' | 'instructor' | 'admin' | 'parent';
  firstName?: string;
  lastName?: string;
};

export type Student = {
  id: number;
  userId: number;
  rollNo: string;
  firstName: string;
  lastName: string;
};

export type Course = {
  id: number;
  name: string;
  code: string;
  semester: string;
  department: string;
  instructorId: number;
};

export type ClassSession = {
  id: number;
  courseId: number;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
};

export type AttendanceRecord = {
  id: number;
  sessionId: number;
  studentId: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  timestamp: string;
  markedById: number;
};

export type Notification = {
  id: number;
  userId: number;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'attendance' | 'system' | 'alert';
};

export type QRAttendanceToken = {
  sessionId: number;
  token: string;
  expiresAt: string;
};