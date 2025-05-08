// File: src/pages/student/MyAttendance.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Course } from '../../types';

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

const MyAttendance: React.FC = () => {
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceSummary();
  }, []);

  const fetchAttendanceSummary = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/attendance/student/summary');
      setSummaries(response.data);
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Attendance</h1>
      
      {summaries.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <p className="text-gray-500">No attendance records found.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6">
          {summaries.map((summary) => (
            <div key={summary.courseId} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {summary.courseCode} - {summary.courseName}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Overall attendance: {summary.attendancePercentage.toFixed(1)}%
                </p>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-green-800">Present</p>
                    <p className="mt-2 text-3xl font-semibold text-green-600">
                      {summary.presentCount}
                    </p>
                    <p className="mt-1 text-xs text-green-700">
                      {((summary.presentCount / summary.totalSessions) * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-red-800">Absent</p>
                    <p className="mt-2 text-3xl font-semibold text-red-600">
                      {summary.absentCount}
                    </p>
                    <p className="mt-1 text-xs text-red-700">
                      {((summary.absentCount / summary.totalSessions) * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-yellow-800">Late</p>
                    <p className="mt-2 text-3xl font-semibold text-yellow-600">
                      {summary.lateCount}
                    </p>
                    <p className="mt-1 text-xs text-yellow-700">
                      {((summary.lateCount / summary.totalSessions) * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-blue-800">Excused</p>
                    <p className="mt-2 text-3xl font-semibold text-blue-600">
                      {summary.excusedCount}
                    </p>
                    <p className="mt-1 text-xs text-blue-700">
                      {((summary.excusedCount / summary.totalSessions) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-4 bg-green-500 rounded-full"
                      style={{ width: `${summary.attendancePercentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>Target: 75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAttendance;