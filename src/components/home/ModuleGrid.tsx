// components/home/ModuleGrid.tsx

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, Users, Briefcase, Shield, Bell, ArrowRight } from "lucide-react";
import AboutJujuyConecta from "../about/AboutJujuyConecta";

type TransportLine = {
  id: string;
  number: string;
  name: string;
  active: boolean;
  created_at: string;
};

type SocialResource = {
  id: string;
  name: string;
  active: boolean;
  verified: boolean;
  schedule: string | null;
  needs: string[] | null;
  created_at: string;
};

type Job = {
  id: string;
  title: string;
  location: string;
  active: boolean;
  featured: boolean;
  created_at: string;
};

type SecurityAlert = {
  id: string;
  title: string;
  category: string;
  active: boolean;
  featured: boolean;
  created_at: string;
};

export function ModuleGrid() {
  const { toast } = useToast();

  // Stats
  const [transportCount, setTransportCount] = useState<number | null>(null);
  const [resourcesCount, setResourcesCount] = useState<number | null>(null);
  const [jobsCount, setJobsCount] = useState<number | null>(null);
  const [securityCount, setSecurityCount] = useState<number | null>(null);

  // Recents
  const [recentLines, setRecentLines] = useState<TransportLine[]>([]);
  const [recentResources, setRecentResources] = useState<SocialResource[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<SecurityAlert[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);

        // Transporte
        {
          const { count, error } = await supabase
            .from("transport_lines")
            .select("*", { count: "exact", head: true })
            .eq("active", true);
          if (error) throw error;
          setTransportCount(count ?? 0);
        }
        {
          const { data, error } = await supabase
            .from("transport_lines")
            .select("id, number, name, active, created_at")
            .order("created_at", { ascending: false })
            .limit(3);
          if (error) throw error;
          setRecentLines(data || []);
        }

        // Recursos sociales
        {
          const { count, error } = await supabase
            .from("social_resources")
            .select("*", { count: "exact", head: true })
            .eq("active", true);
          if (error) throw error;
          setResourcesCount(count ?? 0);
        }
        {
          const { data, error } = await supabase
            .from("social_resources")
            .select("id, name, active, verified, schedule, needs, created_at")
            .order("created_at", { ascending: false })
            .limit(3);
          if (error) throw error;
          setRecentResources(data || []);
        }

        // Empleos
        {
          const { count, error } = await supabase
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .eq("active", true);
          if (error) throw error;
          setJobsCount(count ?? 0);
        }
        {
          const { data, error } = await supabase
            .from("jobs")
            .select("id, title, location, active, featured, created_at")
            .eq("active", true)
            .order("featured", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(3);
          if (error) throw error;
          setRecentJobs(data || []);
        }

        // Seguridad
        {
          const { count, error } = await supabase
            .from("security_alerts")
            .select("*", { count: "exact", head: true })
            .eq("active", true);
          if (error) throw error;
          setSecurityCount(count ?? 0);
        }
        {
          const { data, error } = await supabase
            .from("security_alerts")
            .select("id, title, category, active, featured, created_at")
            .eq("active", true)
            .order("featured", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(3);
          if (error) throw error;
          setRecentAlerts(data || []);
        }
      } catch (e: any) {
        console.error(e);
        toast({
          title: "No se pudieron cargar los módulos",
          description: e?.message || "Intentá nuevamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [toast]);

  const transportStats = useMemo(
    () => (transportCount != null ? `${transportCount} línea${transportCount === 1 ? "" : "s"} activas` : "—"),
    [transportCount]
  );
  const resourcesStats = useMemo(
    () => (resourcesCount != null ? `${resourcesCount} recurso${resourcesCount === 1 ? "" : "s"} activos` : "—"),
    [resourcesCount]
  );
  const jobsStats = useMemo(
    () => (jobsCount != null ? `${jobsCount} empleo${jobsCount === 1 ? "" : "s"} disponibles` : "—"),
    [jobsCount]
  );
  const alertsStats = useMemo(
    () => (securityCount != null ? `${securityCount} alerta${securityCount === 1 ? "" : "s"} activas` : "—"),
    [securityCount]
  );

  const modules = [
    {
      key: "transport",
      title: "Transporte Público",
      description: "Estado de líneas, paradas y reportes ciudadanos",
      icon: Bus,
      href: "/transport",
      color: "primary",
      stats: transportStats,
      recent: recentLines.map((l) => `Línea ${l.number}: ${l.name}`),
    },
    {
      key: "resources",
      title: "Recursos Sociales",
      description: "Comedores, merenderos y centros con ubicación y horarios",
      icon: Users,
      href: "/resources",
      color: "secondary",
      stats: resourcesStats,
      recent: recentResources.map((r) => {
        const needs =
          r.needs && r.needs.length > 0
            ? `Necesita: ${r.needs.slice(0, 2).join(", ")}`
            : r.schedule
            ? "Abierto"
            : "Disponible";
        return `${r.name} — ${needs}`;
      }),
    },
    {
      key: "jobs",
      title: "Bolsa de Trabajo",
      description: "Empleos formales e informales con contacto seguro",
      icon: Briefcase,
      href: "/jobs",
      color: "success",
      stats: jobsStats,
      recent: recentJobs.map((j) => `${j.title}${j.location ? " — " + j.location : ""}`),
    },
    {
      key: "security",
      title: "Seguridad Digital",
      description: "Estafas, grooming y fraudes con guías de prevención",
      icon: Shield,
      href: "/security",
      color: "warning",
      stats: alertsStats,
      recent: recentAlerts.map((a) => `${a.category}: ${a.title}`),
    },
  ] as const;

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "border-primary/20 hover:border-primary/40 hover:shadow-glow";
      case "secondary":
        return "border-secondary/20 hover:border-secondary/40 hover:shadow-glow-secondary";
      case "success":
        return "border-emerald-500/20 hover:border-emerald-500/40";
      case "warning":
        return "border-amber-500/20 hover:border-amber-500/40";
      default:
        return "border-primary/20 hover:border-primary/40";
    }
  };

  const getIconColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary/10 text-primary";
      case "secondary":
        return "bg-secondary/10 text-secondary";
      case "success":
        return "bg-emerald-500/10 text-emerald-600";
      case "warning":
        return "bg-amber-500/10 text-amber-600";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Servicios disponibles</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Accedé a la información que necesitás para moverte y crecer en Jujuy
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.key}
                className={`transition-smooth ${getColorClasses(module.color)} hover:scale-[1.02]`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${getIconColorClasses(module.color)}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{module.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {loading ? "Cargando..." : module.stats}
                        </Badge>
                      </div>
                    </div>
                    <Link to={module.href}>
                      <Button variant="ghost" size="sm" aria-label={`Ir a ${module.title}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <CardDescription className="text-base mt-2">{module.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Actividad reciente:</h4>
                    {loading ? (
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                      </div>
                    ) : module.recent.length > 0 ? (
                      module.recent.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin novedades por ahora.</p>
                    )}
                  </div>

                  <Link to={module.href}>
                    <Button className="w-full" variant="outline">
                      Explorar {module.title.toLowerCase()}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <AboutJujuyConecta />
        {/* Notification CTA */}
        {/* <div className="mt-16 text-center">
          <Card className="max-w-md mx-auto border-primary/20 bg-gradient-primary/5">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Activá tus alertas</CardTitle>
              <CardDescription>Recibí notificaciones personalizadas sobre transporte, empleos y más</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/notifications">
                <Button className="w-full shadow-glow">
                  Configurar notificaciones
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </section>
  );
}
