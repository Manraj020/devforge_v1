import { createContext, useContext, useMemo, useState } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const storedUser = localStorage.getItem("devforge-user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("devforge-user");
    localStorage.removeItem("devforge-token");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);

  async function login(credentials) {
    setLoading(true);
    try {
      const { data } = await authApi.login(credentials);
      localStorage.setItem("devforge-token", data.token);
      localStorage.setItem("devforge-user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function signup(details) {
    setLoading(true);
    try {
      const { data } = await authApi.register(details);
      return data;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("devforge-token");
    localStorage.removeItem("devforge-user");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), loading, login, signup, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
