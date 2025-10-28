// src/components/onboarding/OnboardingOnce.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Radio, Newspaper, Heart, ShoppingCart, Calendar, Users, X } from "lucide-react";

type Props = {
  onOpenAssistant?: () => void;
  storageKey?: string; // cambiá la key si querés mostrarlo de nuevo en el futuro
};

const STORAGE_KEY_DEFAULT = "jc_onboarding_shown_v2";

/**
 * Onboarding revisado para Jujuy Conecta
 * - Muestra 1 vez (localStorage).
 * - Explica el enfoque y los servicios principales.
 * - CTAs rápidos para ir a Podcast, Diario, Apoyar, Tienda, Eventos y Recursos.
 */
export function OnboardingOnce({ onOpenAssistant, storageKey = STORAGE_KEY_DEFAULT }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      // marcamos como visto inmediatamente para evitar que vuelva a aparecer si recargan
      localStorage.setItem(storageKey, String(Date.now()));
      setShow(true);
    }
  }, [storageKey]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => setShow(false)}
        aria-hidden
      />

      {/* Panel */}
      <Card
        className="
          relative w-full max-w-2xl rounded-2xl border border-white/10
          bg-neutral-950/95 text-neutral-100 shadow-2xl
          p-4 sm:p-6
          animate-in fade-in zoom-in-95
        "
        role="dialog"
        aria-modal="true"
        aria-label="Guía rápida de Jujuy Conecta"
      >
        {/* Cerrar */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Encabezado */}
        <div className="mb-3">
          <h2 className="text-lg sm:text-xl font-semibold">¡Bienvenido/a a Jujuy Conecta!</h2>
          <p className="text-sm text-neutral-300">
            Somos un proyecto local para potenciar ideas del Norte argentino.
          </p>
        </div>

        {/* Mensaje de foco */}
        <div className="mb-4">
          <p className="text-sm text-neutral-300">
            Nuestro enfoque: contar historias reales, apoyar emprendimientos locales y ofrecer herramientas prácticas
            ( turismo, eventos, novedades, innovacion). Todo hecho con esfuerzo, transparencia y comunidad.
          </p>
        </div>

        {/* Tips / Servicios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          <Tip icon={<Radio className="h-4 w-4" />} title="Podcast" text="Entrevistas y relatos para conocer a quienes transforman la región." />
          <Tip icon={<Newspaper className="h-4 w-4" />} title="Diario Digital" text="Noticias locales, reportajes y agenda cultural con perspectiva regional." />
          {/* <Tip icon={<Heart className="h-4 w-4" />} title="Apoyar" text="Microdonaciones y patrocinios para sostener contenido independiente." /> */}
          {/* <Tip icon={<ShoppingCart className="h-4 w-4" />} title="Tienda" text="Productos locales y diseños exclusivos impulsando la economía regional." /> */}
          <Tip icon={<Calendar className="h-4 w-4" />} title="Eventos" text="Charlas, catas y encuentros para conectar personas y proyectos." />
          <Tip icon={<Users className="h-4 w-4" />} title="Recursos" text="Guías, contactos y servicios útiles para emprendedores y ONG." />
        </div>

        {/* CTA principales */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <Button asChild variant="ghost" className="w-full text-left">
            <Link to="/podcast" className="flex items-center gap-2 w-full">
              <Radio className="h-4 w-4" /> Ver Podcast
            </Link>
          </Button>

          <Button asChild variant="ghost" className="w-full text-left">
            <Link to="/diario" className="flex items-center gap-2 w-full">
              <Newspaper className="h-4 w-4" /> Ver Diario
            </Link>
          </Button>

          <Button asChild variant="ghost" className="w-full text-left">
            <Link to="/apoyar" className="flex items-center gap-2 w-full">
              <Heart className="h-4 w-4" /> Apoyar / Donar
            </Link>
          </Button>

          {/* <Button asChild variant="ghost" className="w-full text-left">
            <Link to="/tienda" className="flex items-center gap-2 w-full">
              <ShoppingCart className="h-4 w-4" /> Tienda
            </Link>
          </Button> */}

          {/* <Button asChild variant="ghost" className="w-full text-left">
            <Link to="/eventos" className="flex items-center gap-2 w-full">
              <Calendar className="h-4 w-4" /> Eventos
            </Link>
          </Button> */}

          <Button
            className="w-full text-left"
            variant="ghost"
            onClick={() => {
              // intenta abrir asistente si se pasó como prop
              if (onOpenAssistant) onOpenAssistant();
            }}
          >
            <MessageCircle className="h-4 w-4 mr-2" /> Probar asistente (IA)
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <div className="text-xs text-neutral-400">
            ¿Querés recibir novedades? Podés suscribirte en la página del diario.
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShow(false)}>Entendido</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Tip({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-2 text-sm">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div>
        <div className="font-medium text-neutral-100 text-sm">{title}</div>
        <div className="text-neutral-300 text-xs">{text}</div>
      </div>
    </div>
  );
}
