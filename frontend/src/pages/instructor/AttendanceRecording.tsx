
// File: src/pages/instructor/AttendanceRecording.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Student, ClassSession } from '../../types';

const AttendanceRecording: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<number, 'present' | 'absent' | 'late' | 'excused'>>({});
  const [allSelected, setAllSelected] = useState<'present' | 'absent' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [session, setSession] = useState<ClassSession | null>(null);

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  const fetchSessionData = async () => {
    setIsLoading(true);
    try {
      // Fetch session details
      const sessionResponse = await axios.get(`/api/sessions/${sessionId}`);
      setSession(sessionResponse.data);
      
      // Fetch students enrolled in the course
      const studentsResponse = await axios.get(`/api/courses/${sessionResponse.data.courseId}/students`);
      setStudents(studentsResponse.data);
      
      // Fetch existing attendance records if any
      const attendanceResponse = await axios.get(`/api/sessions/${sessionId}/attendance`);
      
      // Convert array to record object
      const attendanceRecord: Record<number, 'present' | 'absent' | 'late' | 'excused'> = {};
      attendanceResponse.data.forEach((record: any) => {
        attendanceRecord[record.studentId] = record.status;
      });
      
      setAttendanceData(attendanceRecord);
    } catch (error) {
      toast.error('Failed to load session data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (studentId: number, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSelectAll = (status: 'present' | 'absent') => {
    const newAttendanceData = { ...attendanceData };
    students.forEach(student => {
      newAttendanceData[student.id] = status;
    });
    setAttendanceData(newAttendanceData);
    setAllSelected(status);
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      const attendanceRecords = Object.entries(attendanceData).map(([studentId, status]) => ({
        sessionId: Number(sessionId),
        studentId: Number(studentId),
        status
      }));
      
      await axios.post(`/api/sessions/${sessionId}/attendance`, { records: attendanceRecords });
      toast.success('Attendance saved successfully');
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Record Attendance</h1>
      
      {session && (
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-medium">{session.courseName}</h2>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div>
              <span className="text-sm text-gray-500">Date:</span>
              <p>{new Date(session.date).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Time:</span>
              <p>{session.startTime} - {session.endTime}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Location:</span>
              <p>{session.location}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => handleSelectAll('present')}
          className={`px-4 py-2 rounded-md text-sm ${allSelected === 'present' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
        >
          Mark All Present
        </button>
        <button
          onClick={() => handleSelectAll('absent')}
          className={`px-4 py-2 rounded-md text-sm ${allSelected === 'absent' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'}`}
        >
          Mark All Absent
        </button>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {students.map(student => (
            <li key={student.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200">
                    {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium">{student.firstName} {student.lastName}</h3>
                    <p className="text-xs text-gray-500">Roll No: {student.rollNo}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusChange(student.id, 'present')}
                    className={`px-3 py-1 rounded text-xs font-medium ${attendanceData[student.id] === 'present' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    className={`px-3 py-1 rounded text-xs font-medium ${attendanceData[student.id] === 'absent' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                  >
                    Absent
                  </button>
                  <button
                    onClick={() => handleStatusChange(student.id, 'late')}
                    className={`px-3 py-1 rounded text-xs font-medium ${attendanceData[student.id] === 'late' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                  >
                    Late
                  </button>
                  <button
                    onClick={() => handleStatusChange(student.id, 'excused')}
                    className={`px-3 py-1 rounded text-xs font-medium ${attendanceData[student.id] === 'excused' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                  >
                    Excused
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-6">
        <button
          onClick={handleSaveAttendance}
          disabled={isSaving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isSaving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>
    </div>
  );
};

export default AttendanceRecording;