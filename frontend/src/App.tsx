// File: src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./components/Layout/Dashboard";
import Profile from "./pages/Profile";
import AttendanceList from "./pages/instructor/AttendanceList";
import AttendanceRecording from "./pages/instructor/AttendanceRecording";
import MyAttendance from "./pages/student/MyAttendance";
import NotificationCenter from "./pages/NotificationCenter";

const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({
  element,
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <>{element}</> : <Navigate to="/login" />;
};

const RoleRoute: React.FC<{
  element: React.ReactNode;
  allowedRoles: string[];
}> = ({ element, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return user && allowedRoles.includes(user.role) ? (
    <>{element}</>
  ) : (
    <Navigate to="/dashboard" />
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/" element={<ProtectedRoute element={<Dashboard />} />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route
          path="dashboard"
          element={<div>Welcome to AttendanceIQ Dashboard</div>}
        />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<NotificationCenter />} />

        {/* Instructor Routes */}
        <Route
          path="attendance"
          element={
            <RoleRoute
              element={<AttendanceList />}
              allowedRoles={["instructor"]}
            />
          }
        />
        <Route
          path="attendance/:sessionId"
          element={
            <RoleRoute
              element={<AttendanceRecording />}
              allowedRoles={["instructor"]}
            />
          }
        />

        {/* Student Routes */}
        <Route
          path="my-attendance"
          element={
            <RoleRoute element={<MyAttendance />} allowedRoles={["student"]} />
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
