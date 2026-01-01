import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, Briefcase, Shield, Newspaper, BusFront } from "lucide-react";
import JujuyConectaAssistantModal from "@/components/assistant/JujuyConectaAssistantModal";
import { OnboardingOnce } from "@/components/onboarding/OnboardingOnce";
import { useAuth } from "@/hooks/useAuth";
import imagenHero from "@/assets/xibixibi.png";
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

  const Stat = ({ icon, value, label }: { icon: React.ReactNode; value: number | null; label: string; }) => (
    <div className="group text-center p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 transition-all hover:bg-white/[0.08] hover:border-primary/30">
      <div className="h-6 w-6 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="text-2xl sm:text-3xl font-bold tabular-nums text-white">
        {loading ? (
          <span className="inline-block h-6 w-16 bg-white/10 rounded animate-pulse" />
        ) : (
          value ?? 0
        )}
      </div>
      <div className="text-[10px] sm:text-xs font-semibold text-white/50 uppercase tracking-[0.1em] mt-1">{label}</div>
    </div>
  );

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-[#020817]">
      {/* FONDO BRANDING: Gradientes basados en el verde de Jujuy Conecta */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full" />
        {/* Trama de puntos sutil para textura */}
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', size: '30px 30px', backgroundSize: '40px 40px' }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
          
          {/* BADGE CON TU VERDE */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium backdrop-blur-xl animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            Conectando a toda la provincia
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-[5rem] font-extrabold tracking-tight leading-[1.1] text-white">
            Todo Jujuy en un <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-teal-300">
              lugar inteligente.
            </span>
          </h1>

          <p className="max-w-2xl text-slate-400 text-lg sm:text-xl leading-relaxed">
            La plataforma centralizada para el transporte, el empleo y la ayuda social. 
            Información <span className="text-white">real, verificada y al alcance</span> de todos.
          </p>

          {/* BOTONES CON BRANDING */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-6">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 h-14 rounded-xl shadow-[0_10px_20px_-10px_rgba(var(--primary),0.5)] transition-all hover:translate-y-[-2px]"
              onClick={() => (window.location.href = "/transport")}
            >
              <BusFront className="mr-2 h-5 w-5" /> Buscar Colectivo
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white h-14 rounded-xl backdrop-blur-md"
              onClick={() => (window.location.href = "https://diario.jujuyconecta.com")}
            >
              <Newspaper className="mr-2 h-5 w-5" /> Diario Digital
            </Button>
          </div>

          {/* STATS GRID */}
          <div className="w-full max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            <Stat icon={<MapPin />} value={counts.lines} label="Líneas de Bus" />
            <Stat icon={<Users />} value={counts.resources} label="Puntos Sociales" />
            <Stat icon={<Briefcase />} value={counts.jobs} label="Bolsa de Trabajo" />
            <Stat icon={<Shield />} value={counts.alerts} label="Alertas Digitales" />
          </div>
          
        </div>
      </div>
    </section>
  );
}
