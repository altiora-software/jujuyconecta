// components/home/Hero.tsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, Briefcase, Shield } from "lucide-react";
import JujuyConectaAssistantModal from "@/components/assistant/JujuyConectaAssistantModal";
import { OnboardingOnce } from "@/components/onboarding/OnboardingOnce";
import { useAuth } from "@/hooks/useAuth";   // ⬅️ usamos tu hook
import imagenHero from "@/assets/jujuy-hero.jpg"

type Counts = {
  lines: number | null;
  resources: number | null;
  jobs: number | null;
  alerts: number | null;
};

export function Hero() {
  const [counts, setCounts] = useState<Counts>({ lines: null, resources: null, jobs: null, alerts: null });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [assistantOpen, setAssistantOpen] = useState(false);

  const { user, loading: authLoading, signInWithGoogle } = useAuth(); // ⬅️

  useEffect(() => {
    (async () => {
      try {
        const [a,b,c,d] = await Promise.all([
          supabase.from("transport_lines").select("*", { count:"exact", head:true }).eq("active", true),
          supabase.from("social_resources").select("*", { count:"exact", head:true }).eq("active", true),
          supabase.from("jobs").select("*", { count:"exact", head:true }).eq("active", true),
          supabase.from("security_alerts").select("*", { count:"exact", head:true }).eq("active", true),
        ]);
        if (a.error || b.error || c.error || d.error) throw (a.error || b.error || c.error || d.error);
        setCounts({
          lines: a.count ?? 0,
          resources: b.count ?? 0,
          jobs: c.count ?? 0,
          alerts: d.count ?? 0,
        });
      } catch (e) {
        console.error(e);
        toast({
          title: "No se pudieron cargar los datos",
          description: "Mostramos números aproximados mientras se reintenta.",
          variant: "destructive",
        });
        setCounts((p) => ({ lines: p.lines ?? 0, resources: p.resources ?? 0, jobs: p.jobs ?? 0, alerts: p.alerts ?? 0 }));
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  // ⬅️ Handler que exige login
  const handleOpenAssistant = useCallback(async () => {
    if (authLoading) return; // todavía cargando el estado de auth
    if (!user) {
      toast({
        title: "Ingresá para usar el asistente",
        description: "Necesitás iniciar sesión para chatear con el asistente.",
      });
      // dispara el flujo de Google (o podés redirigir a /auth)
      await signInWithGoogle();
      return;
    }
    setAssistantOpen(true);
  }, [authLoading, user, signInWithGoogle, toast]);

  const Stat = ({ icon, value, label }: { icon: React.ReactNode; value: number | null; label: string }) => (
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
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32" />
          <img src={imagenHero} alt="no hay dara que mostrar"/>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            La primer plataforma{" "}
            <span className="block text-secondary-glow">impulsada por IA local</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
            Explorá la historia y el turismo, accedé a recursos comunitarios, colectivos y oportunidades laborales.
            Todo en un solo lugar, pensado para los jujeños.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={handleOpenAssistant}>
              Hablar con el asistente
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <Stat icon={<MapPin />} value={counts.lines} label="Líneas de colectivo activas" />
            <Stat icon={<Users />} value={counts.resources} label="Recursos sociales activos" />
            <Stat icon={<Briefcase />} value={counts.jobs} label="Empleos activos" />
            <Stat icon={<Shield />} value={counts.alerts} label="Alertas de seguridad activas" />
          </div>
        </div>
      </div>

      <OnboardingOnce onOpenAssistant={handleOpenAssistant} />

      {/* Solo abrimos el modal si hay usuario */}
      {assistantOpen && user && (
        <JujuyConectaAssistantModal open={assistantOpen} onClose={() => setAssistantOpen(false)} />
      )}
    </section>
  );
}
