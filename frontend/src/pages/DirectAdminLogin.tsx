import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const DirectAdminLogin: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const executeDirectLogin = async () => {
    setIsLoggingIn(true);
    setError(null);

    try {
      // Configure axios defaults for CORS
      axios.defaults.withCredentials = true;

      // Direct API call without going through the auth context
      const response = await axios.post(
        "/api/auth/login",
        {
          email: "admin@example.com",
          password: "Admin123!",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("Login response:", response.data);

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set auth header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast.success("Admin login successful!");
      navigate("/admin");
    } catch (error: any) {
      console.error("Direct login failed:", error);

      // More detailed error information
      let errorMessage = "Login failed - check console for details";

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);

        errorMessage = `Server error: ${error.response.status} - ${
          error.response.data?.message || error.response.statusText
        }`;

        if (error.response.status === 403) {
          errorMessage =
            "Access forbidden. Please check your CORS configuration.";
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        errorMessage =
          "No response received from server. Check if backend is running.";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Direct Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This page will attempt to login directly as the default admin
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Default Admin Credentials
          </h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> admin@example.com
            </p>
            <p className="text-sm text-gray-600">
              <strong>Password:</strong> Admin123!
            </p>
          </div>

          <div className="bg-yellow-50 p-4 mb-4 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800">
              Having trouble logging in?
            </h4>
            <ul className="mt-2 text-xs text-yellow-700 list-disc pl-5">
              <li>Make sure the backend server is running</li>
              <li>Check for CORS errors in the console</li>
              <li>Verify the API URL is correctly configured</li>
            </ul>
          </div>

          <button
            onClick={executeDirectLogin}
            disabled={isLoggingIn}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {isLoggingIn ? "Logging in..." : "Login as Admin"}
          </button>
        </div>

        <div className="text-center mt-4">
          <a
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to regular login
          </a>
        </div>
      </div>
    </div>
  );
};

export default DirectAdminLogin;
