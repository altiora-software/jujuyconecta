import { useState, useEffect } from "react";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123"
};

export const useAdminAuth = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem("admin-token");
    if (adminToken === "admin-authenticated") {
      setIsAdminLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem("admin-token", "admin-authenticated");
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("admin-token");
    setIsAdminLoggedIn(false);
  };

  return {
    isAdminLoggedIn,
    isLoading,
    login,
    logout
  };
};