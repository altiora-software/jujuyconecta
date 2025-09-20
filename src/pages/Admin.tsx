import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

const Admin = () => {
  const { isAdminLoggedIn, isLoading, login, logout } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return <AdminLogin onLogin={login} />;
  }

  return <AdminDashboard onLogout={logout} />;
};

export default Admin;
