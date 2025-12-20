import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Bus,
  Building,
  Briefcase,
  Shield,
  AlertTriangle,
  Store,
  Mountain,
  CalendarRange,
  LogOut,
} from "lucide-react";

import { TransportLinesManager } from "./TransportLinesManager";
import { SocialResourcesManager } from "./SocialResourcesManager";
import { JobsManager } from "./JobsManager";
import { SecurityAlertsManager } from "./SecurityAlertsManager";
import { TransportReportsManager } from "./TransportReportsManager";
import { TourismPlacesManager } from "./TourismPlacesManager";
import { MarketplaceManager } from "./MarketplaceManager";
import { TourismHotelsManager } from "./TourismHotelsManager";

interface AdminDashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  totalLines: number;
  totalReports: number;
  totalResources: number;
  totalJobs: number;
  totalAlerts: number;
  totalProfiles: number;
  totalTourismPlaces: number;
  totalMarketplaceItems: number;
  totalCommunityEvents: number;
}

const TABS_STORAGE_KEY = "adminDashboard.activeTab";

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalLines: 0,
    totalReports: 0,
    totalResources: 0,
    totalJobs: 0,
    totalAlerts: 0,
    totalProfiles: 0,
    totalTourismPlaces: 0,
    totalMarketplaceItems: 0,
    totalCommunityEvents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Estado controlado del tab activo + persistencia en localStorage
  const [activeTab, setActiveTab] = useState<string>("transport");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(TABS_STORAGE_KEY);
      if (saved) {
        setActiveTab(saved);
      }
    } catch {
      // si falla localStorage no rompemos nada
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    try {
      window.localStorage.setItem(TABS_STORAGE_KEY, value);
    } catch {
      // ignore
    }
  };

  // ✅ fetchStats estable, no se recrea en cada render
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);

      const [
        { count: linesCount },
        { count: reportsCount },
        { count: resourcesCount },
        { count: jobsCount },
        { count: alertsCount },
        { count: profilesCount },
        { count: tourismCount },
        { count: marketplaceCount },
        { count: communityEventsCount },
      ] = await Promise.all([
        supabase
          .from("transport_lines")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("transport_reports")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("social_resources")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("job_submissions")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("security_alerts")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("tourism_places")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("local_businesses")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("tourism_hotels")
          .select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalLines: linesCount || 0,
        totalReports: reportsCount || 0,
        totalResources: resourcesCount || 0,
        totalJobs: jobsCount || 0,
        totalAlerts: alertsCount || 0,
        totalProfiles: profilesCount || 0,
        totalTourismPlaces: tourismCount || 0,
        totalMarketplaceItems: marketplaceCount || 0,
        totalCommunityEvents: communityEventsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refreshStats = () => {
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Panel de Administración
              </h1>
              <p className="text-muted-foreground">Gestión de Jujuy Conecta</p>
            </div>
            <Button variant="outline" onClick={onLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuarios registrados
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalProfiles}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Líneas de transporte
              </CardTitle>
              <Bus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalLines}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reportes de transporte
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalReports}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recursos sociales
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalResources}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ofertas de empleo
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalJobs}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alertas de seguridad
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalAlerts}
              </div>
            </CardContent>
          </Card>

          {/* Turismo */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lugares turísticos
              </CardTitle>
              <Mountain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalTourismPlaces}
              </div>
            </CardContent>
          </Card>

          {/* Marketplace */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Emprendimientos en marketplace
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalMarketplaceItems}
              </div>
            </CardContent>
          </Card>

          {/* Agenda comunitaria */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Eventos de agenda comunitaria
              </CardTitle>
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalCommunityEvents}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full min-w-0">
          <div className="md:top-[64px] z-20">
            <div className="rounded-3xl border bg-card/90 backdrop-blur shadow px-2 py-2">
              <TabsList
                className="
                  w-full h-auto p-0 bg-transparent
                  grid grid-cols-2 gap-2
                  sm:grid-cols-3
                  lg:grid-cols-4
                  xl:flex xl:flex-wrap xl:gap-2
                "
              >
                <TabsTrigger value="transport" className="w-full xl:w-auto rounded-2xl">
                  Transporte
                </TabsTrigger>
                <TabsTrigger value="resources" className="w-full xl:w-auto rounded-2xl">
                  Recursos
                </TabsTrigger>
                <TabsTrigger value="jobs" className="w-full xl:w-auto rounded-2xl">
                  Empleos
                </TabsTrigger>
                <TabsTrigger value="security" className="w-full xl:w-auto rounded-2xl">
                  Seguridad
                </TabsTrigger>

                <TabsTrigger value="tourism" className="w-full xl:w-auto rounded-2xl">
                  Turismo
                </TabsTrigger>
                <TabsTrigger value="hotels" className="w-full xl:w-auto rounded-2xl">
                  Hoteles
                </TabsTrigger>

                <TabsTrigger value="marketplace" className="w-full xl:w-auto rounded-2xl">
                  Marketplace
                </TabsTrigger>
                <TabsTrigger value="agenda" className="w-full xl:w-auto rounded-2xl">
                  Agenda
                </TabsTrigger>
                <TabsTrigger value="reports" className="w-full xl:w-auto rounded-2xl">
                  Reportes
                </TabsTrigger>
              </TabsList>

              <div className="mt-2 h-1 bg-gradient-to-r from-sky-500/40 via-emerald-500/30 to-purple-500/40 rounded-b-3xl" />
            </div>
          </div>

          <TabsContent value="transport" className="mt-6 min-w-0">
            <TransportLinesManager onUpdate={refreshStats} />
          </TabsContent>

          <TabsContent value="resources" className="mt-6 min-w-0">
            <SocialResourcesManager onUpdate={refreshStats} />
          </TabsContent>

          <TabsContent value="jobs" className="mt-6 min-w-0">
            <JobsManager onUpdate={refreshStats} />
          </TabsContent>

          <TabsContent value="security" className="mt-6 min-w-0">
            <SecurityAlertsManager onUpdate={refreshStats} />
          </TabsContent>

          <TabsContent value="tourism" className="mt-6 min-w-0">
            <TourismPlacesManager onUpdate={refreshStats} />
          </TabsContent>

          <TabsContent value="hotels" className="mt-6 min-w-0">
            <TourismHotelsManager onUpdate={refreshStats} />
          </TabsContent>

          <TabsContent value="marketplace" className="mt-6 min-w-0">
            <MarketplaceManager onUpdate={refreshStats} />
          </TabsContent>

          <TabsContent value="agenda" className="mt-6 min-w-0">
            <Card>
              <CardHeader>
                <CardTitle>Agenda comunitaria</CardTitle>
                <CardDescription>
                  Gestión de eventos, actividades y propuestas locales.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Este tab está listo para que montes el administrador de la agenda comunitaria.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6 min-w-0">
            <TransportReportsManager onUpdate={refreshStats} />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};
