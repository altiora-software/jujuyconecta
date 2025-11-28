import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, Briefcase, Shield, Newspaper, BusFront } from "lucide-react";
import JujuyConectaAssistantModal from "@/components/assistant/JujuyConectaAssistantModal";
import { OnboardingOnce } from "@/components/onboarding/OnboardingOnce";
import { useAuth } from "@/hooks/useAuth";
import imagenHero from "@/assets/hornocal.webp";
import AiTrainingModal from "@/components/aiTrainingModal/AiTrainingModal";

type Counts = {
  lines: number | null;
  resources: number | null;
  jobs: number | null;
  alerts: number | null;
};

export function Hero() {
  const [open, setOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [counts, setCounts] = useState<Counts>({
    lines: null,
    resources: null,
    jobs: null,
    alerts: null,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();

  // 🔥 NUEVO: cargar stats desde /api/home
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/home");

        if (!res.ok) throw new Error("Error fetching /api/home");

        const json = await res.json();

        if (cancelled) return;
        setCounts({
          lines: json.lines?.length ?? 0,
          resources: json.social?.length ?? 0,
          jobs: json.jobs?.length ?? 0,
          alerts: json.alerts?.length ?? 0,
        });
      } catch (err) {
        if (!cancelled) {
          console.error("Hero /api/home error:", err);
          toast({
            title: "No se pudieron cargar los datos",
            description: "Mostramos números aproximados mientras se reintenta.",
            variant: "destructive",
          });

          setCounts((p) => ({
            lines: p.lines ?? 0,
            resources: p.resources ?? 0,
            jobs: p.jobs ?? 0,
            alerts: p.alerts ?? 0,
          }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  const handleOpenAssistant = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setOpen(true);
      return;
    }
    setOpen(true);
  }, [authLoading, user]);

  const handleContinueWithGoogle = useCallback(async () => {
    await signInWithGoogle();
  }, [signInWithGoogle]);

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
      <div className="h-8 w-8 mx-auto mb-2 text-yellow-400">{icon}</div>

      <div
        className="
          text-3xl
          font-extrabold
          tabular-nums
          text-black
          drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]
        "
      >
        {loading ? (
          <span className="inline-block h-6 w-16 bg-white/30 rounded animate-pulse" />
        ) : (
          value ?? 0
        )}
      </div>

      <div className="text-sm font-semibold text-black">{label}</div>
    </div>
  );

  return (
    <section
      className="relative overflow-hidden text-black"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="absolute inset-0">
        <img
          src={imagenHero}
          alt="Jujuy desde arriba, colores del Hornocal, conectando toda la provincia en una sola plataforma"
          className="w-full h-full object-cover object-center scale-[1.15] sm:scale-[1.2] lg:scale-[1.25] transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-hero/45 sm:bg-gradient-hero/40 lg:bg-gradient-hero/35" />
        <div className="hidden sm:block absolute -top-24 -left-24 w-64 h-64 bg-white/25 rounded-full blur-3xl" />
        <div className="hidden sm:block absolute -bottom-28 -right-28 w-[28rem] h-[28rem] bg-white/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4">
          <div className="min-h-[70svh] sm:min-h-[68svh] lg:min-h-[60svh] flex flex-col items-center justify-center text-center gap-6 py-12 sm:py-14 lg:py-20">

            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
                Todo Jujuy en un lugar claro y fácil de usar.
              </span>
            </h1>

            <p className="max-w-[56rem] text-base sm:text-lg lg:text-xl/7 opacity-95">
              Colectivos, mapas, empleos, ayuda social y noticias al día.  
              Todo organizado para que encuentres lo que necesitás sin perder tiempo.
            </p>

            <div className="w-full max-w-2xl flex flex-col xs:flex-row gap-3 justify-center items-center">
              <div className="flex gap-3 w-full xs:w-auto flex-wrap justify-center">
                <Button
                  size="lg"
                  className="w-full xs:w-auto"
                  onClick={() => (window.location.href = "/transport")}
                >
                  <BusFront className="mr-2" /> Encontrar mi colectivo ahora
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full xs:w-auto hover:animate-glow"
                  onClick={() => (window.location.href = "https://diario.jujuyconecta.com")}
                >
                  <Newspaper className="mr-2" /> Ver qué está pasando hoy
                </Button>

                <Button
                  size="lg"
                  className="w-full xs:w-auto"
                  onClick={() => (window.location.href = "/turismo")}
                >
                  <Briefcase className="mr-2" /> Conocé la provincia
                </Button>
              </div>
            </div>

            <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-4 ">
              <Stat icon={<MapPin />} value={counts.lines} label="Líneas para no perder tiempo" />
              <Stat icon={<Users />} value={counts.resources} label="Lugares donde te dan una mano" />
              <Stat icon={<Briefcase />} value={counts.jobs} label="Oportunidades de trabajo activas" />
              <Stat icon={<Shield />} value={counts.alerts} label="Alertas para que no te agarren desprevenido" />
            </div>

            <p className="text-xs sm:text-[13px] text-blue/80 max-w-[34rem] mt-2">
              Los datos pueden cambiar según el día y la fuente. Usá la info como guía y, si algo no cierra, escribinos a jujuyconecta@gmail.com para revisarlo.
            </p>

          </div>
        </div>
      </div>

      <OnboardingOnce onOpenAssistant={handleOpenAssistant} />

      <AiTrainingModal
        open={open}
        onClose={() => setOpen(false)}
        supportEmail="jujuyconecta@gmail.com"
      />

      {assistantOpen && user && (
        <JujuyConectaAssistantModal open={assistantOpen} onClose={() => setAssistantOpen(false)} />
      )}
    </section>
  );
}
