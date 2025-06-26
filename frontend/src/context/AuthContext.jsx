import React, { createContext, useContext, useState, useEffect } from "react";
import api, { setupAxiosInterceptors } from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // NEW

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      setupAxiosInterceptors(); // configure API headers
    }

    setLoading(false); // done loading localStorage
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
      setupAxiosInterceptors(); // apply token for future requests
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    }
  };

  const register = async (form) => {
    try {
      const res = await api.post("/api/auth/register", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
      setupAxiosInterceptors();
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Registration failed"
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        error,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
