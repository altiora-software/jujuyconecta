import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, Briefcase, Shield } from "lucide-react";
import JujuyConectaAssistantModal from "@/components/assistant/JujuyConectaAssistantModal";
import { OnboardingOnce } from "@/components/onboarding/OnboardingOnce";
import { useAuth } from "@/hooks/useAuth";
import imagenHero from "@/assets/jujuy-hero.jpg";
import LoginRequiredDialog from "@/components/auth/LoginRequiredDialog";

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

  const { user, loading: authLoading, signInWithGoogle } = useAuth();

  // NEW: estado para el modal de login
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

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

  const handleOpenAssistant = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setLoginDialogOpen(true);
      return;
    }
    setAssistantOpen(true);
  }, [authLoading, user]);

  // Callback que se ejecuta cuando el usuario aceptó términos y clickea "Continuar con Google"
  const handleContinueWithGoogle = useCallback(async () => {
    await signInWithGoogle();
    // si el login fue exitoso, el hook debería actualizar "user" y se cerrará el modal con onClose
  }, [signInWithGoogle]);

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
    <section
      className="relative overflow-hidden text-black"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Capa base: imagen full + overlay verde translúcido */}
      <div className="absolute inset-0">
        <img
          src={imagenHero}
          alt="Paisaje de Jujuy"
          className="w-full h-full object-cover object-center scale-[1.15] sm:scale-[1.2] lg:scale-[1.25] transition-transform duration-700"
        />
        {/* Verde más translúcido para que se vea la imagen */}
        <div className="absolute inset-0 bg-gradient-hero/45 sm:bg-gradient-hero/40 lg:bg-gradient-hero/35" />
        {/* Blobs suaves (ocultos en xs para no tapar) */}
        <div className="hidden sm:block absolute -top-24 -left-24 w-64 h-64 bg-white/25 rounded-full blur-3xl" />
        <div className="hidden sm:block absolute -bottom-28 -right-28 w-[28rem] h-[28rem] bg-white/20 rounded-full blur-3xl" />
      </div>

      {/* Contenido */}
      <div className="relative z-10">
        <div className="container mx-auto px-4">
          <div className="min-h-[70svh] sm:min-h-[68svh] lg:min-h-[60svh] flex flex-col items-center justify-center text-center gap-6 py-12 sm:py-14 lg:py-20">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
              La forma más simple de{" "}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-teal-500">
                conectarte con Jujuy
              </span>
            </h1>

            <p className="max-w-[34rem] text-base sm:text-lg lg:text-2xl/8 opacity-95">
              Explorá historia y turismo, accedé a recursos comunitarios y transporte, y recibí alertas para cuidarte en internet.
              Pensada para jujeños y turistas.
            </p>

            {/* CTA */}
            <div className="w-full max-w-md flex flex-col xs:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="w-full xs:w-auto hover:animate-glow"
                onClick={handleOpenAssistant}
              >
                Hablar con el asistente
              </Button>
            </div>

            {/* Stats: 2 columnas en móvil, 4 en md+ */}
            <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-2">
              <Stat icon={<MapPin />} value={counts.lines} label="Líneas activas" />
              <Stat icon={<Users />} value={counts.resources} label="Recursos activos" />
              <Stat icon={<Briefcase />} value={counts.jobs} label="Empleos activos" />
              <Stat icon={<Shield />} value={counts.alerts} label="Alertas activas" />
            </div>

            {/* Disclaimer corto (legible en mobile) */}
            <p className="text-xs sm:text-[13px] text-white/80 max-w-[34rem]">
              Datos de fuentes públicas; podrían cambiar. Verificá con fuentes oficiales.
            </p>
          </div>
        </div>
      </div>

      {/* Onboarding + Modales */}
      <OnboardingOnce onOpenAssistant={handleOpenAssistant} />

      <LoginRequiredDialog
        open={loginDialogOpen && !user}
        onClose={() => setLoginDialogOpen(false)}
        onContinueWithGoogle={handleContinueWithGoogle}
      />

      {assistantOpen && user && (
        <JujuyConectaAssistantModal open={assistantOpen} onClose={() => setAssistantOpen(false)} />
      )}
    </section>


  );
}
