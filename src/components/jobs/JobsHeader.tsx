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
        {/* Card principal */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-background to-background p-6 md:p-8 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
          <div className="absolute -right-20 -top-10 h-40 w-40 rounded-full bg-emerald-400/30 blur-2xl" />

          {/* Chip superior */}
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
              {showHowItWorks ? "Ocultar información" : "Qué es y cómo funciona"}
              {showHowItWorks ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </span>
          </button>

          {/* Título y bajada */}
          <div className="mt-3">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black-50 mb-1">
              Oportunidades laborales verificadas en Jujuy
            </h1>
            <p className="text-sm md:text-base text-black-100/80 max-w-xl">
              Reunimos avisos de trabajo publicados por empresas, comercios,
              estudios, organizaciones y emprendedores de la provincia.
              Jujuy Conecta organiza la información para que veas rápido de qué
              se trata cada propuesta y sigas el canal de contacto indicado por
              el empleador.
            </p>
          </div>

          {/* Explicación larga */}
          {showHowItWorks && (
            <p className="mt-3 text-xs md:text-sm text-black-50/85 max-w-xl">
              Esta sección funciona como un puente informativo: te mostramos
              el detalle de la oferta, el lugar, el tipo de puesto y el medio
              oficial para postularte (formulario externo, correo, WhatsApp,
              sitio web u otro canal definido por quien publica). Jujuy Conecta
              no recibe CVs ni participa en el proceso de selección, solo ayuda
              a que encuentres oportunidades de manera clara y ordenada.
            </p>
          )}

          {/* Stats */}
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
                  Ofertas publicadas
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

          {/* Panel contextual según stat */}
          {activeStat && (
            <div className="mt-3 rounded-2xl border border-border/60 bg-card/85 backdrop-blur-sm p-3 text-[11px] md:text-xs text-muted-foreground space-y-1">
              {activeStat === "jobs" && (
                <>
                  <p>
                    Estas son las ofertas que están vigentes y visibles hoy en
                    la bolsa de trabajo de Jujuy Conecta. Algunas tienen plazos
                    de postulación definidos por el empleador o pueden cerrarse
                    antes si el puesto se cubre.
                  </p>
                  <p>
                    Leé siempre las condiciones completas y seguí el medio de
                    contacto oficial indicado en cada aviso para enviar tu CV o
                    completar la postulación.
                  </p>
                </>
              )}

              {activeStat === "municipalities" && (
                <>
                  <p>
                    Hay avisos publicados en {totalMunicipalities} municipios
                    de la provincia. La idea es mostrar un panorama real de
                    oportunidades laborales en Jujuy, no solo en la capital.
                  </p>
                  <p>
                    Podés filtrar por municipio para ver qué opciones hay cerca
                    de tu zona y organizar mejor tu búsqueda.
                  </p>
                </>
              )}

              {activeStat === "categories" && (
                <>
                  <p>
                    Las ofertas están distribuidas en {totalCategories} rubros,
                    que incluyen comercio, servicios, administración, oficios,
                    salud, educación, tecnología y otros sectores.
                  </p>
                  <p>
                    Usá los filtros por rubro para enfocarte en los tipos de
                    trabajo que mejor se ajustan a tu perfil y experiencia.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Panel empleadores */}
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
                    ¿Buscás personal para tu equipo?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Estamos construyendo un módulo para que comercios, empresas
                    y emprendimientos de Jujuy puedan difundir sus búsquedas
                    laborales en la misma plataforma que la gente ya usa para
                    transporte, noticias y servicios.
                  </p>
                  <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span>
                      {showEmployersInfo
                        ? "Ocultar información"
                        : "Ver qué se está pensando para empleadores"}
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
                <p>
                  La primera versión del módulo de empleadores va a estar
                  enfocada en:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Publicar avisos con datos claros del puesto, requisitos y
                    forma de contacto.
                  </li>
                  <li>
                    Destacar búsquedas puntuales para que aparezcan primero en
                    los listados.
                  </li>
                  <li>
                    Llegar a personas que viven y trabajan en Jujuy, dentro de
                    un entorno pensado para la provincia.
                  </li>
                </ul>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground/90">
                  <Users className="h-3 w-3" />
                  <span>
                    Jujuy Conecta actúa como canal de difusión de avisos, no
                    como consultora de recursos humanos ni intermediaria en la
                    contratación.
                  </span>
                </div>
                <Badge variant="outline" className="self-start text-[11px]">
                  Módulo para empleadores, próximamente
                </Badge>
              </div>
            )}

            {!showEmployersInfo && (
              <Badge
                variant="outline"
                className="self-start text-[11px] mt-1"
              >
                Tocá para ver cómo se va a integrar
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator />
    </section>
  );
}
