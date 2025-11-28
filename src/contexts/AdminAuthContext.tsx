// src/contexts/AdminAuthContext.tsx

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AdminAuthContextValue = {
  isAdminLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAdminLoggedIn(false);
        return false;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        setIsAdminLoggedIn(false);
        return false;
      }

      const isAdmin = profile === "admin";
      setIsAdminLoggedIn(isAdmin);
      return isAdmin;
    } catch (err) {
      console.error("Error checking admin session:", err);
      setIsAdminLoggedIn(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // chequeo inicial
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        checkSession(); // 1 consulta por evento, centralizada
      }

      if (event === "SIGNED_OUT") {
        setIsAdminLoggedIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession]);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authErr || !authData.user) {
          throw new Error(authErr?.message || "Credenciales inválidas");
        }

        // NO volvemos a pegar a profiles acá directamente.
        // Reutilizamos checkSession para que haya UNA sola fuente de verdad.
        const isAdmin = await checkSession();

        if (!isAdmin) {
          await supabase.auth.signOut();
          return false;
        }

        return true;
      } catch (err) {
        console.error("Error en login:", err);
        return false;
      }
    },
    [checkSession]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAdminLoggedIn(false);
  }, []);

  const value: AdminAuthContextValue = {
    isAdminLoggedIn,
    isLoading,
    login,
    logout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth debe usarse dentro de <AdminAuthProvider>");
  }
  return ctx;
};
