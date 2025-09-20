import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, Settings, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export function AuthButton() {
  const { user, profile, loading, signInWithGoogle, signOut, isAdmin } = useAuth();

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={signInWithGoogle}
        className="gap-2"
      >
        <LogIn className="h-4 w-4" />
        Ingresar
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "Usuario"} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {profile?.full_name && (
              <p className="font-medium">{profile.full_name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuItem asChild>
          <Link to="/notifications" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Notificaciones
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Panel Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={signOut} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}