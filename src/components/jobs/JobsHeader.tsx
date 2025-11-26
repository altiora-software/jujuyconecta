// src/components/jobs/JobsHeader.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";

interface JobsHeaderProps {
  totalJobs: number;
  totalMunicipalities: number;
  totalCategories: number;
}

type ActiveStat = "jobs" | "municipalities" | "categories" | null;

export function JobsHeader({
  totalJobs,
  totalMunicipalities,
  totalCategories,
}: JobsHeaderProps) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showEmployersInfo, setShowEmployersInfo] = useState(false);
  const [activeStat, setActiveStat] = useState<ActiveStat>(null);

  const toggleStat = (stat: ActiveStat) => {
    setActiveStat((current) => (current === stat ? null : stat));
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)] items-stretch">
        {/* Card principal, estilo similar al TransportHero */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-background to-background p-6 md:p-8 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
          <div className="absolute -right-20 -top-10 h-40 w-40 rounded-full bg-emerald-400/30 blur-2xl" />

          {/* Chip superior con toggle de explicación */}
          <button
            type="button"
            onClick={() => setShowHowItWorks((s) => !s)}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-500/20 px-3 py-1 text-[11px] md:text-xs shadow-soft hover:shadow-md transition-all"
          >
            <Briefcase className="h-4 w-4 text-black-50" />
            <span className="font-medium text-black-50">
              Bolsa de trabajo Jujuy Conecta
            </span>
            <span className="ml-1 inline-flex items-center gap-1 text-[10px] text-black-100/80">
              {showHowItWorks ? "Ocultar detalles" : "Cómo funciona"}
              {showHowItWorks ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </span>
          </button>

          {/* Título y bajada, mismos tonos que el hero de transporte */}
          <div className="mt-3">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black-50 mb-1">
              Oportunidades laborales reales en toda la provincia
            </h1>
            <p className="text-sm md:text-base text-black-100/80 max-w-xl">
              Encontrá trabajos formales, changas y propuestas locales. Sin humo
              ni formularios eternos, con datos claros para decidir rápido si te
              sirve o no, y guardar lo que te interesa para verlo después desde
              el celu.
            </p>
          </div>

          {/* Explicación larga solo si el usuario la pide */}
          {showHowItWorks && (
            <p className="mt-3 text-xs md:text-sm text-black-50/85 max-w-xl">
              Jujuy Conecta junta avisos de comercios, empresas, estudios,
              oficios y emprendimientos de la provincia. Podés filtrar por
              rubro, municipio, tipo de jornada y modalidad, y si instalás la
              app tenés la bolsa de trabajo a un toque en la pantalla de inicio
              de tu teléfono.
            </p>
          )}

          {/* Stats con el mismo tipo de “cuadraditos” de colores que transporte */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-xs md:text-sm">
            <button
              type="button"
              className="text-left"
              onClick={() => toggleStat("jobs")}
            >
              <div
                className={`rounded-2xl border p-3 bg-emerald-500/15 border-emerald-300/70 hover:-translate-y-[2px] hover:shadow-soft transition-all ${
                  activeStat === "jobs" ? "ring-1 ring-emerald-300/70" : ""
                }`}
              >
                <p className="text-[11px] text-black-50 mb-1">
                  Ofertas activas
                </p>
                <p className="text-lg font-semibold text-black-50">
                  {totalJobs}
                </p>
              </div>
            </button>

            <button
              type="button"
              className="text-left"
              onClick={() => toggleStat("municipalities")}
            >
              <div
                className={`rounded-2xl border p-3 bg-sky-500/15 border-sky-300/70 hover:-translate-y-[2px] hover:shadow-soft transition-all ${
                  activeStat === "municipalities"
                    ? "ring-1 ring-sky-300/70"
                    : ""
                }`}
              >
                <p className="text-[11px] text-black-50 mb-1">Municipios</p>
                <p className="text-lg font-semibold text-black-50">
                  {totalMunicipalities}
                </p>
              </div>
            </button>

            <button
              type="button"
              className="text-left"
              onClick={() => toggleStat("categories")}
            >
              <div
                className={`rounded-2xl border p-3 bg-amber-500/15 border-amber-300/70 hover:-translate-y-[2px] hover:shadow-soft transition-all ${
                  activeStat === "categories"
                    ? "ring-1 ring-amber-300/70"
                    : ""
                }`}
              >
                <p className="text-[11px] text-amber-50 mb-1">Rubros</p>
                <p className="text-lg font-semibold text-amber-50">
                  {totalCategories}
                </p>
              </div>
            </button>
          </div>

          {/* Panel contextual según stat seleccionada, igual idea que el panel lateral de transporte */}
          {activeStat && (
            <div className="mt-3 rounded-2xl border border-border/60 bg-card/85 backdrop-blur-sm p-3 text-[11px] md:text-xs text-muted-foreground space-y-1">
              {activeStat === "jobs" && (
                <>
                  <p>
                    Estas son las ofertas que están vigentes hoy en Jujuy
                    Conecta. Algunas se cubren rápido: si ves algo que te sirve,
                    guardalo o contactá al toque.
                  </p>
                  <p>
                    Usá los filtros para quedarte solo con lo que tenga sentido
                    para vos, y si instalás la app podés revisar nuevas ofertas
                    en segundos.
                  </p>
                </>
              )}

              {activeStat === "municipalities" && (
                <>
                  <p>
                    Ya hay avisos cargados en {totalMunicipalities} municipios
                    de la provincia, no solo en capital. La idea es que tengas
                    un mapa laboral real de Jujuy.
                  </p>
                  <p>
                    Filtrá por municipio para ver qué hay cerca tuyo y armate
                    tu propio radar de oportunidades locales.
                  </p>
                </>
              )}

              {activeStat === "categories" && (
                <>
                  <p>
                    Tenés ofertas en {totalCategories} rubros: comercios,
                    servicios, administración, oficios, tech y más. No es solo
                    “oficina”, también laburo real de calle.
                  </p>
                  <p>
                    Probá cambiar de rubro en los filtros para descubrir
                    opciones que quizás no estabas buscando, y usá Jujuy
                    Conecta seguido para ver qué rubros se mueven más.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Panel lateral empleadores, espejito del panel lateral de transporte */}
        <div className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-5 md:p-6 flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setShowEmployersInfo((s) => !s)}
            >
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 mt-0.5 text-primary" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-foreground">
                    ¿Ofrecés trabajo?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Publicá tus búsquedas laborales en un lugar que la gente ya
                    usa para transporte, noticias y oportunidades en Jujuy.
                  </p>
                  <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span>
                      {showEmployersInfo
                        ? "Ocultar cómo va a funcionar"
                        : "Ver cómo va a funcionar"}
                    </span>
                    {showEmployersInfo ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </div>
              </div>
            </button>

            {showEmployersInfo && (
              <div className="text-xs md:text-sm text-muted-foreground space-y-2 animate-in fade-in slide-in-from-top-1">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Publicá gratis tus avisos básicos.</li>
                  <li>Destacá los avisos que necesitás cubrir urgente.</li>
                  <li>
                    Llegá a personas que viven realmente en Jujuy y usan la
                    plataforma a diario.
                  </li>
                </ul>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground/90">
                  <Users className="h-3 w-3" />
                  <span>
                    Instalando Jujuy Conecta en el celular, vas a poder revisar
                    avisos y postulaciones desde el mismo ícono en tu pantalla
                    principal.
                  </span>
                </div>
                <Badge variant="outline" className="self-start text-[11px]">
                  Módulo empleadores próximamente
                </Badge>
              </div>
            )}

            {!showEmployersInfo && (
              <Badge
                variant="outline"
                className="self-start text-[11px] mt-1"
              >
                Tocá para ver los próximos pasos
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator />
    </section>
  );
}
