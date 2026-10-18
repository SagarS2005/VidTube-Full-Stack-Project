import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/users/current-user");
      setUser(res.data.data);
      return res.data.data;
    } catch {
      localStorage.removeItem("accessToken");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials) => {
    const res = await api.post("/users/login", credentials);
    const loggedUser = res.data?.data?.user;
    const token = res.data?.data?.accessToken;
    if (token) {
      localStorage.setItem("accessToken", token);
    }
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = async () => {
    try {
      await api.post("/users/logout");
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  const updateUser = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : updates));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);