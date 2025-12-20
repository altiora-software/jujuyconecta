import { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Button } from "@/components/ui/button";

type AdminGateState = {
  checked: boolean; // ya hicimos el check al menos una vez en esta sesión de pestaña
  isAdmin: boolean;
};

const STORAGE_KEY = "jc_admin_gate_v1";

function readGate(): AdminGateState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.checked !== "boolean") return null;
    if (typeof parsed?.isAdmin !== "boolean") return null;
    return parsed as AdminGateState;
  } catch {
    return null;
  }
}

function writeGate(v: AdminGateState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    // ignore
  }
}

function clearGate() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const Admin = () => {
  const { isAdminLoggedIn, isLoading, login, logout } = useAdminAuth();

  // Estado cacheado para NO re-checkear cada vez que volvés a esta pestaña
  const [gate, setGate] = useState<AdminGateState>(() => {
    return readGate() ?? { checked: false, isAdmin: false };
  });

  // Si todavía no hicimos check en esta sesión, dejamos pasar el loading normal.
  const shouldShowLoading = useMemo(() => {
    return !gate.checked && isLoading;
  }, [gate.checked, isLoading]);

  // Cuando el hook termina de cargar por primera vez, guardamos el resultado y no jodemos más.
  useEffect(() => {
    // Si ya quedó cacheado, no lo pisamos
    if (gate.checked) return;

    // Esperamos a que termine el check inicial
    if (isLoading) return;

    const next: AdminGateState = { checked: true, isAdmin: !!isAdminLoggedIn };
    setGate(next);
    writeGate(next);
  }, [gate.checked, isLoading, isAdminLoggedIn]);

  const handleManualRefresh = () => {
    // Esto fuerza a que se vuelva a mostrar “Verificando acceso…”
    // y a que el hook re-evalúe (al re-render y al leer su estado actual).
    const next: AdminGateState = { checked: false, isAdmin: false };
    setGate(next);
    writeGate(next);
  };

  const handleLogout = () => {
    clearGate();
    setGate({ checked: false, isAdmin: false });
    logout();
  };

  const handleLogin = async (...args: any[]) => {
    const ok = await (login as any)(...args);
    // Si login ya actualiza isAdminLoggedIn, el effect lo va a cachear igual.
    // Pero acá lo dejamos inmediato por UX.
    const next: AdminGateState = { checked: true, isAdmin: true };
    setGate(next);
    writeGate(next);
    return ok;
  };

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center w-full max-w-sm space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Verificando acceso...</p>
          <p className="text-xs text-muted-foreground">
            Esto se hace una sola vez. Si querés revalidar, usá “Recargar”.
          </p>
        </div>
      </div>
    );
  }

  // A partir de acá, usamos el estado cacheado (gate) para NO recargar en cada visita.
  if (!gate.isAdmin) {
    return (
      <div className="min-h-screen">
        <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur px-4 py-3">
          <div className="mx-auto max-w-6xl flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Admin, acceso restringido
            </div>
            <Button variant="outline" size="sm" onClick={handleManualRefresh}>
              Recargar
            </Button>
          </div>
        </div>

        <div className="px-4 py-6">
          <AdminLogin onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
      <div className="px-4 py-6">
        <AdminDashboard onLogout={handleLogout} />
      </div>
    
  );
};

export default Admin;
