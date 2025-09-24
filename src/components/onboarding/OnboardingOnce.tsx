// src/components/onboarding/OnboardingOnce.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Bus, Users, Briefcase, Shield, X } from "lucide-react";

type Props = {
  onOpenAssistant?: () => void;
  storageKey?: string; // cambiá la key si querés mostrarlo de nuevo en el futuro
};

const STORAGE_KEY_DEFAULT = "jc_onboarding_shown_v1";

/**
 * Muestra una guía mínima solo 1 vez por navegador.
 * - Se marca como visto apenas se muestra para evitar repetir si recargan.
 * - Cambiá storageKey para “versionar” el onboarding.
 */
export function OnboardingOnce({ onOpenAssistant, storageKey = STORAGE_KEY_DEFAULT }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      setShow(true);
      localStorage.setItem(storageKey, String(Date.now()));
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

      {/* Panel: modal centrado en desktop, bottom-sheet en mobile */}
      <Card
        className="
          relative w-full max-w-xl rounded-2xl border border-white/10
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

        {/* Título + subtítulo súper breves */}
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">¡Bienvenido/a a Jujuy Conecta!</h2>
          <p className="text-sm text-neutral-300">
            4 formas rápidas de usar la app:
          </p>
        </div>

        {/* 4 tips (cortitos, con ícono) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          <Tip icon={<Bus className="h-4 w-4" />} text="Líneas y paradas: mirá detalles y reportes." />
          <Tip icon={<Users className="h-4 w-4" />} text="Recursos sociales: comedores y centros cerca." />
          <Tip icon={<Briefcase className="h-4 w-4" />} text="Empleos: formales e informales con filtros." />
          <Tip icon={<Shield className="h-4 w-4" />} text="Seguridad: alertas y consejos antiestafas." />
        </div>

        {/* CTA grandes (dos acciones clave) */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* <Button
            className="w-full bg-primary text-white hover:opacity-90"
            onClick={() => {
              onOpenAssistant?.();
              setShow(false);
            }}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Probar el asistente (IA)
          </Button> */}

          <div className="grid grid-cols-2 gap-2 w-full text-white">
            <Button asChild variant="destructive" className="w-full">
              <Link to="/transport"><Bus className="h-4 w-4 mr-2" /> Transporte</Link>
            </Button>
            <Button asChild variant="destructive" className="w-full">
              <Link to="/resources"><Users className="h-4 w-4 mr-2" /> Recursos</Link>
            </Button>
            <Button asChild variant="destructive" className="w-full">
              <Link to="/jobs"><Briefcase className="h-4 w-4 mr-2" /> Empleos</Link>
            </Button>
            <Button asChild variant="destructive" className="w-full">
              <Link to="/security"><Shield className="h-4 w-4 mr-2" /> Seguridad</Link>
            </Button>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button variant="ghost" onClick={() => setShow(false)}>
            Entendido
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Tip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2 text-sm">
      <span className="text-primary">{icon}</span>
      <span className="text-green-200">{text}</span>
    </div>
  );
}
