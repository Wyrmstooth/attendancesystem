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

// Mock user data for demo purposes
const MOCK_USER: User = {
  id: "1",
  name: "Demo User",
  email: "demo@example.com",
  // Add any other properties needed by your User type
};

// Mock token for demo purposes
const MOCK_TOKEN = "demo-jwt-token";

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(MOCK_USER); // Initialize with mock user
  const [token, setToken] = useState<string | null>(MOCK_TOKEN); // Initialize with mock token
  const [loading, setLoading] = useState(false); // Start with loading false

  useEffect(() => {
    // For demo, always set the auth header
    axios.defaults.headers.common["Authorization"] = `Bearer ${MOCK_TOKEN}`;

    // Simulate a delay to mimic API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Mock fetch user data - no actual API call
  const fetchUserData = async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUser(MOCK_USER);
    setLoading(false);
  };

  // Mock login function - always succeeds
  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Always succeed with mock data
      localStorage.setItem("token", MOCK_TOKEN);
      setToken(MOCK_TOKEN);
      setUser(MOCK_USER);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      // No errors in demo mode
    }
  };

  // Keep logout functionality to clear state
  const logout = () => {
    // For demo, we can simulate logging out
    setLoading(true);

    setTimeout(() => {
      // Don't actually remove token for demo
      // localStorage.removeItem('token');

      // If you want to show the logout flow, uncomment these:
      // setToken(null);
      // setUser(null);

      // For demo, let's just reset to our mock data after a brief moment
      setToken(MOCK_TOKEN);
      setUser(MOCK_USER);
      setLoading(false);
    }, 500);
  };

  // Mock password reset - always succeeds
  const resetPassword = async (email: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Always succeed in demo mode
    console.log(`Demo: Password reset email would be sent to ${email}`);
    return;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: true, // Always authenticated for demo
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
