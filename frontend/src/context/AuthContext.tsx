// File: src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { User } from "../types";
import { loginUser, loginAdmin, loginInstructor } from "../services/api";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (
    email: string,
    password: string,
    role?: "STUDENT" | "INSTRUCTOR" | "ADMIN"
  ) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing token and user in localStorage
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    } else {
      // Remove Authorization header if no token
      delete axios.defaults.headers.common["Authorization"];
    }

    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN" = "STUDENT"
  ) => {
    setLoading(true);

    console.log("Attempting login with:", email);

    try {
      let response;
      if (role === "ADMIN") {
        response = await loginAdmin(email, password);
      } else if (role === "INSTRUCTOR") {
        response = await loginInstructor(email, password);
      } else {
        response = await loginUser(email, password);
      }
      console.log("Login response:", response.data);

      const { token, user } = response.data;

      // Enforce role match: only allow login if user.role matches the login page role
      if (user.role !== role) {
        throw new Error(
          `You are not authorized to log in as ${role.toLowerCase()}.`
        );
      }

      if (!token || !user) {
        console.error("Invalid response format - missing token or user data");
        throw new Error("Invalid login response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("Login successful, auth header set");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    delete axios.defaults.headers.common["Authorization"];
    navigate("/"); // Redirect to home page after logout
  };

  const resetPassword = async (email: string) => {
    try {
      await axios.post("/api/auth/reset-password", { email });
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
