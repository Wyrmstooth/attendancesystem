// File: src/pages/instructor/QRCodeGenerator.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';
import { Course, ClassSession } from '../../types';

const QRCodeGenerator: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [qrValue, setQrValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [expiryTime, setExpiryTime] = useState<number>(5); // Default 5 minutes
  const [countdown, setCountdown] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchSessions(selectedCourse);
    }
  }, [selectedCourse]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      // QR code expired
      setQrValue('');
      toast.error('QR code has expired. Generate a new one.');
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/courses/instructor');
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessions = async (courseId: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/courses/${courseId}/sessions`);
      // Filter to only get today's sessions or future sessions
      const todayAndFutureSessions = response.data.filter((session: ClassSession) => {
        const sessionDate = new Date(session.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return sessionDate >= today;
      });
      setSessions(todayAndFutureSessions);
      setSelectedSession(null);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(Number(e.target.value));
    setSelectedSession(null);
    setQrValue('');
    setCountdown(null);
  };

  const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSession(Number(e.target.value));
    setQrValue('');
    setCountdown(null);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExpiryTime(Number(e.target.value));
  };

  const generateQRCode = async () => {
    if (!selectedSession) {
      toast.error('Please select a session first');
      return;
    }

    try {
      // In a real implementation, we'd create a unique token on the server
      // For now, we'll generate a simple code with session ID and timestamp
      const timestamp = Date.now();
      const token = `attendance:${selectedSession}:${timestamp}`;
      
      // In a real application, we would make an API call to register this token
      // await axios.post('/api/attendance/generate-qr', { sessionId: selectedSession, expiryMinutes: expiryTime });
      
      setQrValue(token);
      setCountdown(expiryTime * 60); // Convert minutes to seconds
      toast.success('QR code generated successfully');
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `attendance-qr-${selectedSession}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading && courses.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">QR Code Attendance</h1>
      
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
            Select Course
          </label>
          <select
            id="course"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedCourse || ''}
            onChange={handleCourseChange}
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-1">
            Select Session
          </label>
          <select
            id="session"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedSession || ''}
            onChange={handleSessionChange}
            disabled={!selectedCourse || sessions.length === 0}
          >
            <option value="">Select a session</option>
            {sessions.map(session => (
              <option key={session.id} value={session.id}>
                {new Date(session.date).toLocaleDateString()} | {session.startTime} - {session.endTime} | {session.location}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
            QR Code Validity
          </label>
          <select
            id="expiry"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={expiryTime}
            onChange={handleExpiryChange}
          >
            <option value="1">1 minute</option>
            <option value="3">3 minutes</option>
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={generateQRCode}
          disabled={!selectedSession}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          Generate QR Code
        </button>
      </div>
      
      {qrValue && (
        <div className="mt-8 flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <QRCode
              id="qr-code"
              value={qrValue}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          
          {countdown !== null && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 mb-2">QR Code expires in:</p>
              <div className="text-2xl font-bold text-indigo-600">{formatCountdown(countdown)}</div>
            </div>
          )}
          
          <div className="mt-4">
            <button
              onClick={downloadQRCode}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Download QR Code
            </button>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Instructions for students:</p>
            <p>1. Open the AttendanceIQ app</p>
            <p>2. Navigate to "Scan QR Code"</p>
            <p>3. Scan this QR code to mark attendance</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;