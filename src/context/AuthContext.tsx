import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { API_CONFIG } from "../config/api";

interface User {
  user_id: string;
  email: string;
  client_id: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user_data");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailid: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Decode JWT to get user info (basic decode, not verification)
        const tokenPayload = JSON.parse(atob(data.token.split(".")[1]));

        const userData: User = {
          user_id: tokenPayload.user_id,
          email: tokenPayload.email,
          client_id: tokenPayload.client_id,
        };

        setToken(data.token);
        setUser(userData);

        // Store in localStorage
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_data", JSON.stringify(userData));

        return true;
      } else {
        console.error("Login failed:", data.message || "Unknown error");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        loading,
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
