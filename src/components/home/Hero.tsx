// components/home/Hero.tsx
"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, MapPin, Users, Briefcase, Shield } from "lucide-react";
import JujuyConectaAssistantModal from "../assistant/JujuyConectaAssistantModal";

type Counts = {
  lines: number | null;
  resources: number | null;
  jobs: number | null;
  alerts: number | null;
};

export function Hero() {
  const [counts, setCounts] = useState<Counts>({
    lines: null,
    resources: null,
    jobs: null,
    alerts: null,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // 1) Líneas activas
        const { count: linesCount, error: linesErr } = await supabase
          .from("transport_lines")
          .select("*", { count: "exact", head: true })
          .eq("active", true);
        if (linesErr) throw linesErr;

        // 2) Recursos sociales activos
        const { count: resourcesCount, error: resErr } = await supabase
          .from("social_resources")
          .select("*", { count: "exact", head: true })
          .eq("active", true);
        if (resErr) throw resErr;

        // 3) Empleos activos (si no tenés columna active, quitá el .eq)
        const { count: jobsCount, error: jobsErr } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("active", true);
        if (jobsErr) throw jobsErr;

        // 4) Alertas activas
        const { count: alertsCount, error: alertsErr } = await supabase
          .from("security_alerts")
          .select("*", { count: "exact", head: true })
          .eq("active", true);
        if (alertsErr) throw alertsErr;

        setCounts({
          lines: linesCount ?? 0,
          resources: resourcesCount ?? 0,
          jobs: jobsCount ?? 0,
          alerts: alertsCount ?? 0,
        });
      } catch (e: any) {
        console.error("Error cargando conteos del hero:", e);
        toast({
          title: "No se pudieron cargar los datos",
          description: "Mostramos números aproximados mientras se reintenta.",
          variant: "destructive",
        });
        // fallback para no mostrar vacío
        setCounts((prev) => ({
          lines: prev.lines ?? 0,
          resources: prev.resources ?? 0,
          jobs: prev.jobs ?? 0,
          alerts: prev.alerts ?? 0,
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [toast]);

  const Stat = ({
    icon,
    value,
    label,
  }: {
    icon: React.ReactNode;
    value: number | null;
    label: string;
  }) => (
    <div className="text-center">
      <div className="h-8 w-8 mx-auto mb-2 text-secondary">{icon}</div>
      <div className="text-2xl font-bold tabular-nums">
        {loading ? <span className="inline-block h-6 w-16 bg-white/30 rounded animate-pulse" /> : value ?? 0}
      </div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );

  return (
    <section className="relative bg-gradient-hero text-white py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Movilidad, ayuda social y oportunidades{" "}
            <span className="block text-secondary-glow">en un solo lugar</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
            La plataforma que conecta a los jujeños con información de transporte en tiempo real,
            recursos comunitarios y oportunidades laborales.
          </p>

          {/* CTAs con navegación */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" variant="secondary" className="shadow-glow-secondary">
              <a href="/resources">
                Explorar recursos
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button onClick={() => setOpen(true)}>Abrir asistente</Button>
            <JujuyConectaAssistantModal open={open} onClose={() => setOpen(false)} />
          </div>

          {/* Stats (reales) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <Stat icon={<MapPin />} value={counts.lines} label="Líneas de colectivo activas" />
            <Stat icon={<Users />} value={counts.resources} label="Recursos sociales activos" />
            <Stat icon={<Briefcase />} value={counts.jobs} label="Empleos activos" />
            <Stat icon={<Shield />} value={counts.alerts} label="Alertas de seguridad activas" />
          </div>
        </div>
      </div>
    </section>
  );
}
