// File: src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";

// Auth
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import InstructorLogin from "./pages/instructor/InstructorLogin";
import Home from "./pages/Home";
import AdminLogin from "./pages/admin/AdminLogin";

// Layouts
import Dashboard from "./components/Layout/Dashboard";
import AdminLayout from "./components/Layout/AdminLayout";

// Student Pages
import MyAttendance from "./pages/student/MyAttendance";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageInstructors from "./pages/admin/ManageInstructors";
import ManageCourses from "./pages/admin/ManageCourses";
import ManageSessions from "./pages/admin/ManageSessions";
import ManageEnrollment from "./pages/admin/ManageEnrollment";
import RegisterAdmin from "./pages/admin/RegisterAdmin";

// Shared Pages
import NotificationCenter from "./pages/NotificationCenter";
import Profile from "./pages/Profile";

// Instructor Pages
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import DashboardHome from "./pages/DashboardHome";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("token") !== null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const InstructorRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== "INSTRUCTOR") {
    return <Navigate to="/login/instructor" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/login/instructor" element={<InstructorLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register/admin" element={<RegisterAdmin />} />

          {/* Main Dashboard Layout - protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="my-attendance" element={<MyAttendance />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin Routes - admin-only */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="instructors" element={<ManageInstructors />} />
            <Route path="courses" element={<ManageCourses />} />
            <Route path="sessions" element={<ManageSessions />} />
            <Route path="enrollment" element={<ManageEnrollment />} />
          </Route>

          {/* Instructor Dashboard - instructor-only */}
          <Route
            path="/dashboard/instructor"
            element={
              <InstructorRoute>
                <InstructorDashboard />
              </InstructorRoute>
            }
          />
          <Route
            path="/dashboard/instructor/attendance"
            element={
              <InstructorRoute>
                <ManageSessions />
              </InstructorRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
