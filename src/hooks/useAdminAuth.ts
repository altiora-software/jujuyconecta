import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAuth = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Chequear sesión actual y rol
  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdminLoggedIn(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      setIsAdminLoggedIn(profile?.role === "admin");
    } catch (err) {
      console.error("Error checking admin session:", err);
      setIsAdminLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();

    // Suscribirse a cambios de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      checkSession();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession]);

  // Login con email/password
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data: authData, error: authErr } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authErr || !authData.user) {
        throw new Error(authErr?.message || "Credenciales inválidas");
      }

      // Verificar perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (profile?.role === "admin") {
        setIsAdminLoggedIn(true);
        return true;
      }

      // Si no es admin, cerrar sesión
      await supabase.auth.signOut();
      return false;
    } catch (err) {
      console.error("Error en login:", err);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdminLoggedIn(false);
  };

  return {
    isAdminLoggedIn,
    isLoading,
    login,
    logout,
  };
};
