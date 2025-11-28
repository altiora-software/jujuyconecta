// components/home/ModuleGrid.tsx

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, Users, Briefcase, Shield, ArrowRight } from "lucide-react";
import AboutJujuyConecta from "../about/AboutJujuyConecta";

type TransportLine = {
  id: string;
  number: string;
  name: string;
  active: boolean;
  created_at?: string;
};

type SocialResource = {
  id: string;
  name: string;
  active: boolean;
  verified: boolean;
  schedule: string | null;
  needs: string[] | null;
  created_at?: string;
};

type Job = {
  id: string;
  title: string;
  location: string;
  active: boolean;
  featured: boolean;
  created_at?: string;
};

type SecurityAlert = {
  id: string;
  title: string;
  category: string;
  active: boolean;
  featured: boolean;
  created_at?: string;
};

type HomeResponse = {
  lines: any[];
  social: any[];
  jobs: any[];
  alerts: any[];
};

export function ModuleGrid() {
  const { toast } = useToast();

  const [transportCount, setTransportCount] = useState<number | null>(null);
  const [resourcesCount, setResourcesCount] = useState<number | null>(null);
  const [jobsCount, setJobsCount] = useState<number | null>(null);
  const [securityCount, setSecurityCount] = useState<number | null>(null);

  const [recentLines, setRecentLines] = useState<TransportLine[]>([]);
  const [recentResources, setRecentResources] = useState<SocialResource[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<SecurityAlert[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/home");
        if (!res.ok) throw new Error("Error al cargar datos desde /api/home");

        const json = (await res.json()) as HomeResponse;

        const lines = json.lines ?? [];
        const social = json.social ?? [];
        const jobs = json.jobs ?? [];
        const alerts = json.alerts ?? [];

        setTransportCount(lines.length);
        setResourcesCount(social.length);
        setJobsCount(jobs.length);
        setSecurityCount(alerts.length);

        setRecentLines(
          lines.slice(0, 3).map((l: any) => ({
            id: l.id,
            number: l.number ?? "",
            name: l.name ?? "",
            active: l.active ?? true,
            created_at: l.created_at,
          }))
        );

        setRecentResources(
          social.slice(0, 3).map((r: any) => ({
            id: r.id,
            name: r.name ?? "",
            active: r.active ?? true,
            verified: r.verified ?? false,
            schedule: r.schedule ?? null,
            needs: r.needs ?? null,
            created_at: r.created_at,
          }))
        );

        setRecentJobs(
          jobs.slice(0, 3).map((j: any) => ({
            id: j.id,
            title: j.title ?? "",
            location: j.city ?? j.municipality ?? "",
            active: j.status ? j.status === "published" : true,
            featured: j.is_featured ?? false,
            created_at: j.created_at ?? j.published_at,
          }))
        );

        setRecentAlerts(
          alerts.slice(0, 3).map((a: any) => ({
            id: a.id,
            title: a.title ?? "",
            category: a.category ?? "",
            active: a.active ?? true,
            featured: a.featured ?? false,
            created_at: a.created_at,
          }))
        );
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
    () =>
      transportCount != null
        ? `${transportCount} línea${transportCount === 1 ? "" : "s"} activas`
        : "—",
    [transportCount]
  );
  const resourcesStats = useMemo(
    () =>
      resourcesCount != null
        ? `${resourcesCount} recurso${resourcesCount === 1 ? "" : "s"} activos`
        : "—",
    [resourcesCount]
  );
  const jobsStats = useMemo(
    () =>
      jobsCount != null
        ? `${jobsCount} empleo${jobsCount === 1 ? "" : "s"} disponibles`
        : "—",
    [jobsCount]
  );
  const alertsStats = useMemo(
    () =>
      securityCount != null
        ? `${securityCount} alerta${securityCount === 1 ? "" : "s"} activas`
        : "—",
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
      recent: recentJobs.map(
        (j) => `${j.title}${j.location ? " — " + j.location : ""}`
      ),
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
        return "border-primary/20 md:hover:border-primary/40 md:hover:shadow-glow";
      case "secondary":
        return "border-secondary/20 md:hover:border-secondary/40 md:hover:shadow-glow-secondary";
      case "success":
        return "border-emerald-500/20 md:hover:border-emerald-500/40";
      case "warning":
        return "border-amber-500/20 md:hover:border-amber-500/40";
      default:
        return "border-primary/20 md:hover:border-primary/40";
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
    <section className="py-12 sm:py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Servicios disponibles
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Accedé a la información que necesitás para moverte y crecer en Jujuy
          </p>
        </div>

        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.key}
                className={`h-full transition-transform duration-200 ${getColorClasses(
                  module.color
                )} md:hover:scale-[1.02]`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-3 rounded-lg ${getIconColorClasses(
                          module.color
                        )}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg md:text-xl">
                          {module.title}
                        </CardTitle>
                        <Badge className="mt-1 text-[10px] sm:text-[11px] md:text-xs">
                          {loading ? "Cargando..." : module.stats}
                        </Badge>
                      </div>
                    </div>

                    <Link to={module.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Ir a ${module.title}`}
                        className="shrink-0"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  <CardDescription className="text-xs sm:text-sm md:text-base mt-2">
                    {module.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 mb-4">
                    <h4 className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">
                      Actividad reciente:
                    </h4>
                    {loading ? (
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                      </div>
                    ) : module.recent.length > 0 ? (
                      module.recent.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 text-[11px] sm:text-xs md:text-sm"
                        >
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Sin novedades por ahora.
                      </p>
                    )}
                  </div>

                  <Link to={module.href}>
                    <Button className="w-full" variant="outline" size="sm">
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
      </div>
    </section>
  );
}
