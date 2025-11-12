import React, { useEffect } from "react";
import { useAppDispatch } from "../hooks/redux";
import { initializeAuth, setLoading } from "../store/slices/authSlice";

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check for stored auth data on app load
    const storedToken = localStorage.getItem("auth_token");
    const storedClientId = localStorage.getItem("client_id");
    const storedUser = localStorage.getItem("user_data");
    const storedUserRole = localStorage.getItem("user_role");

    if (storedToken && storedClientId && storedUser && storedUserRole) {
      try {
        const userData = JSON.parse(storedUser);
        dispatch(
          initializeAuth({
            token: storedToken,
            clientId: storedClientId,
            user: userData,
            role: storedUserRole,
          })
        );
      } catch (error) {
        console.error("Error parsing stored auth data:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("client_id");
        localStorage.removeItem("user_data");
        localStorage.removeItem("user_role");
        dispatch(setLoading(false));
      }
    } else {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
