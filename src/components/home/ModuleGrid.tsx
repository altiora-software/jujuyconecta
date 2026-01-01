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
        if (!res.ok) throw new Error("Error al cargar datos");

        const json = (await res.json()) as HomeResponse;

        const lines = json.lines ?? [];
        const social = json.social ?? [];
        const jobs = json.jobs ?? [];
        const alerts = json.alerts ?? [];

        setTransportCount(lines.length);
        setResourcesCount(social.length);
        setJobsCount(jobs.length);
        setSecurityCount(alerts.length);

        setRecentLines(lines.slice(0, 3).map((l: any) => ({
          id: l.id,
          number: l.number ?? "",
          name: l.name ?? "",
          active: l.active ?? true,
          created_at: l.created_at,
        })));

        setRecentResources(social.slice(0, 3).map((r: any) => ({
          id: r.id,
          name: r.name ?? "",
          active: r.active ?? true,
          verified: r.verified ?? false,
          schedule: r.schedule ?? null,
          needs: r.needs ?? null,
          created_at: r.created_at,
        })));

        setRecentJobs(jobs.slice(0, 3).map((j: any) => ({
          id: j.id,
          title: j.title ?? "",
          location: j.city ?? j.municipality ?? "",
          active: j.status ? j.status === "published" : true,
          featured: j.is_featured ?? false,
          created_at: j.created_at ?? j.published_at,
        })));

        setRecentAlerts(alerts.slice(0, 3).map((a: any) => ({
          id: a.id,
          title: a.title ?? "",
          category: a.category ?? "",
          active: a.active ?? true,
          featured: a.featured ?? false,
          created_at: a.created_at,
        })));
      } catch (e: any) {
        console.error(e);
        toast({
          title: "Error de conexión",
          description: "No pudimos sincronizar los datos en tiempo real.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [toast]);

  const transportStats = useMemo(() => transportCount != null ? `${transportCount} líneas activas` : "—", [transportCount]);
  const resourcesStats = useMemo(() => resourcesCount != null ? `${resourcesCount} recursos activos` : "—", [resourcesCount]);
  const jobsStats = useMemo(() => jobsCount != null ? `${jobsCount} empleos disponibles` : "—", [jobsCount]);
  const alertsStats = useMemo(() => securityCount != null ? `${securityCount} alertas activas` : "—", [securityCount]);

  const modules = [
    {
      key: "transport",
      title: "Transporte Público",
      description: "Estado de líneas, paradas y reportes en tiempo real.",
      icon: Bus,
      href: "/transport",
      stats: transportStats,
      recent: recentLines.map((l) => `Línea ${l.number}: ${l.name}`),
    },
    {
      key: "resources",
      title: "Recursos Sociales",
      description: "Centros de ayuda, comedores y asistencia directa.",
      icon: Users,
      href: "/resources",
      stats: resourcesStats,
      recent: recentResources.map((r) => `${r.name} — ${r.needs?.length ? "Necesita donaciones" : "Disponible"}`),
    },
    {
      key: "jobs",
      title: "Bolsa de Trabajo",
      description: "Oportunidades laborales formales e independientes.",
      icon: Briefcase,
      href: "/jobs",
      stats: jobsStats,
      recent: recentJobs.map((j) => `${j.title}${j.location ? " en " + j.location : ""}`),
    },
    {
      key: "security",
      title: "Seguridad Digital",
      description: "Prevención de estafas, grooming y delitos digitales.",
      icon: Shield,
      href: "/security",
      stats: alertsStats,
      recent: recentAlerts.map((a) => `${a.category}: ${a.title}`),
    },
  ] as const;

  return (
    <section id="servicios" className="py-20 sm:py-28 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary px-4 py-1">
            Ecosistema Digital
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
            Servicios <span className="text-primary">Conectados</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Accedé a información pública centralizada para moverte y crecer en Jujuy.
          </p>
        </div>

        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.key}
                className="group h-full transition-all duration-300 border border-primary/10 bg-card/50 backdrop-blur-sm md:hover:-translate-y-1 md:hover:border-primary/40 md:hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)]"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3.5 rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110 duration-300">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl md:text-2xl font-bold italic tracking-tight uppercase">
                          {module.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                           <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                             {loading ? "Cargando..." : module.stats}
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    <Link to={module.href}>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary hover:text-white transition-colors">
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>

                  <CardDescription className="text-sm sm:text-base mt-4 leading-relaxed">
                    {module.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="bg-muted/30 rounded-xl p-4 mb-6 border border-border/50">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-primary/40" />
                      Novedades
                    </h4>
                    <div className="space-y-3">
                      {loading ? (
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                          <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                        </div>
                      ) : module.recent.length > 0 ? (
                        module.recent.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                            <ArrowRight className="h-3 w-3 mt-1 text-primary shrink-0 opacity-50" />
                            <span className="line-clamp-1 group-hover:text-foreground transition-colors">{item}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Sin actualizaciones recientes.</p>
                      )}
                    </div>
                  </div>

                  <Link to={module.href} className="block">
                    <Button className="w-full bg-primary/5 hover:bg-primary hover:text-white text-primary border-primary/20 transition-all font-bold" variant="outline">
                      Explorar módulo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-20">
          <AboutJujuyConecta />
        </div>
      </div>
    </section>
  );
}