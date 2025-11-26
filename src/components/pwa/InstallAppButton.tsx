// src/components/pwa/InstallAppButton.tsx
"use client";

import { useEffect, useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, X, Smartphone } from "lucide-react";

const DISMISS_KEY = "jc_pwa_dismissed_until";
// días que esperamos antes de volver a mostrar el prompt
const DISMISS_DAYS = 1;

export function InstallAppButton() {
  const { isInstallable, installed, install } = usePWAInstall();
  const [visible, setVisible] = useState(false);

  // Chequeo de “no ahora” recordado en localStorage
  useEffect(() => {
    if (!isInstallable || installed) {
      setVisible(false);
      return;
    }

    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(DISMISS_KEY);
      if (!raw) {
        setVisible(true);
        return;
      }

      const until = new Date(raw);
      // Si ya pasó la fecha de “no molestar”, volvemos a mostrar
      if (isNaN(until.getTime()) || until < new Date()) {
        setVisible(true);
      }
    } catch {
      // Si algo falla con localStorage, no bloqueamos el prompt
      setVisible(true);
    }
  }, [isInstallable, installed]);

  // Usuario decide instalar
  const handleInstall = async () => {
    try {
      await install();
      // Si la instalación falla, no lo ocultamos de una
      // La mayoría de browsers igual cierran el banner nativo
      setVisible(false);
    } catch {
      // Podrías loguear el error si usás analytics de eventos
      console.error("PWA install rejected");
    }
  };

  // Usuario dice “ahora no”
  const handleDismiss = () => {
    setVisible(false);

    if (typeof window === "undefined") return;

    try {
      const until = new Date();
      until.setDate(until.getDate() + DISMISS_DAYS);
      window.localStorage.setItem(DISMISS_KEY, until.toISOString());
    } catch {
      // Si no se puede escribir, no pasa nada: solo no recordamos el rechazo
    }
  };

  if (!visible || !isInstallable || installed) return null;

  return (
    <div
      className="
        fixed bottom-4 left-1/2 z-50 -translate-x-1/2
        w-[90%] max-w-md
        rounded-2xl border border-emerald-500/40 bg-background/95
        shadow-[0_18px_45px_rgba(0,0,0,0.35)]
        backdrop-blur-sm
        animate-in fade-in zoom-in-95
      "
      aria-label="Instalar Jujuy Conecta en tu dispositivo"
    >
      <div className="flex items-start gap-3 px-4 pt-3">
        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/90 text-white">
          <Smartphone className="h-5 w-5" />
        </div>

        <div className="flex-1 space-y-1 pr-6">
          <p className="text-sm font-semibold leading-tight">
            Llevá Jujuy Conecta en el bolsillo
          </p>
          <p className="text-xs text-muted-foreground leading-snug">
            Acceso directo a noticias, colectivos, mapa turístico y alertas, 
            sin depender del navegador y sin instalar una app pesada.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="mt-1 rounded-full p-1 text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground transition"
          aria-label="No mostrar más por ahora"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={handleInstall}
          className="
            inline-flex flex-1 items-center justify-center gap-2
            rounded-full bg-emerald-600 px-3 py-2
            text-xs font-semibold text-white
            hover:bg-emerald-700 active:scale-[0.98]
            transition
          "
        >
          <Download className="h-4 w-4" />
          <span>Instalar Jujuy Conecta</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="
            text-[11px] font-medium text-muted-foreground
            px-2 py-1 rounded-full hover:bg-muted/60 transition
          "
        >
          Ahora no
        </button>
      </div>

      <div className="px-4 pb-3">
        <p className="text-[10px] text-muted-foreground/80 leading-tight">
          Sin registro, sin publicidad extra. Solo un acceso directo a la
          información de Jujuy, incluso cuando estás apurado en la calle.
        </p>
      </div>
    </div>
  );
}
