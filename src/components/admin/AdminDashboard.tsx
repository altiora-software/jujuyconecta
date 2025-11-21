import { useState, useEffect } from "react";
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
// Cuando tengas managers específicos, los importás acá
// import { MarketplaceManager } from "./MarketplaceManager";
// import { CommunityAgendaManager } from "./CommunityAgendaManager";

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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
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
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase
          .from("security_alerts")
          .select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("tourism_places")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("marketplace_items")
          .select("*", { count: "exact", head: true }),
        // si tu tabla de agenda se llama distinto, cambiá "community_events"
        supabase
          .from("community_events")
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
  };

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
        <Tabs defaultValue="transport" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="transport">Transporte</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
            <TabsTrigger value="jobs">Empleos</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="tourism">Turismo</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="agenda">Agenda comunitaria</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="transport" className="mt-6">
            <TransportLinesManager onUpdate={refreshStats} />
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <SocialResourcesManager onUpdate={refreshStats} />
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <JobsManager onUpdate={refreshStats} />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecurityAlertsManager onUpdate={refreshStats} />
          </TabsContent>

          <TabsContent value="tourism" className="mt-6">
            <TourismPlacesManager onUpdate={refreshStats} />
          </TabsContent>

          {/* Cuando tengas los managers reales, reemplazás estos placeholders */}
          <TabsContent value="marketplace" className="mt-6">
            {/* <MarketplaceManager onUpdate={refreshStats} /> */}
            <Card>
              <CardHeader>
                <CardTitle>Marketplace Local</CardTitle>
                <CardDescription>
                  Administración de emprendimientos publicados en el marketplace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acá va a vivir el módulo para revisar, aprobar y editar fichas
                  de emprendedores. Podés crear un componente
                  MarketplaceManager y montarlo en este lugar.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agenda" className="mt-6">
            {/* <CommunityAgendaManager onUpdate={refreshStats} /> */}
            <Card>
              <CardHeader>
                <CardTitle>Agenda comunitaria</CardTitle>
                <CardDescription>
                  Gestión de eventos, actividades y propuestas locales.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Este tab está listo para que montes el administrador de la
                  agenda comunitaria, usando la tabla que definas
                  para eventos (por ejemplo community_events).
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <TransportReportsManager onUpdate={refreshStats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
