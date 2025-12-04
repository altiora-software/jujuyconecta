'use client'

import { Link } from "react-router-dom";
import { Megaphone, Music2 } from "lucide-react";

// --- TRACKING GA4 + GTM ---
const trackCosquinBannerClick = () => {
  try {
    // GA4 nativo
    if (typeof window !== "undefined" && typeof (window as any).gtag !== "undefined") {
      (window as any).gtag("event", "promo_cosquin_banner_click", {
        event_category: "Promos",
        event_label: "Banner Plataforma - Cosquín Rock 2026",
        value: 1,
      });
    }

    // Google Tag Manager
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "promo_cosquin_banner_click",
        banner_name: "Cosquin Plataforma 2026",
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.warn("GA Tracking error:", err);
  }
};

export function CosquinPromoBannerPlataforma() {
  return (
    <section className="mt-4">
      <Link
        to="/cosquin-rock-2026"
        onClick={trackCosquinBannerClick}
        className="
          block w-full overflow-hidden rounded-2xl 
          bg-gradient-to-r from-[#111827] via-[#020617] to-[#111827]
          border border-emerald-500/40 
          hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20
          transition
        "
      >
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-4 md:flex-row md:items-center">

          {/* Lado izquierdo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Especial Jujuy Conecta
              </p>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Cosquín Rock 2026
              </h2>
              <p className="text-xs text-emerald-200">
                Guía para jujeños que bajan a Punilla
              </p>
            </div>
          </div>

          {/* Lado derecho */}
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-end">
            <p className="text-xs sm:text-sm text-slate-200 max-w-md">
              Info de viaje, grilla interactiva, tips y cobertura especial
              desde el NOA. Todo centralizado en un solo módulo.
            </p>

            <div className="flex items-center gap-2 md:justify-end">
              <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-emerald-900/60 px-3 py-1 text-[0.7rem] font-semibold text-emerald-200">
                <Megaphone className="h-4 w-4" />
                Especial de verano
              </span>

              <span
                className="
                  inline-flex items-center justify-center rounded-full 
                  bg-emerald-500 px-4 py-1.5 text-xs font-semibold 
                  uppercase tracking-[0.16em] text-black
                  hover:bg-emerald-400 transition
                "
              >
                Abrir especial
              </span>
            </div>
          </div>

        </div>
      </Link>
    </section>
  );
}
