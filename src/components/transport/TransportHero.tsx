import { useState } from "react";
import { Bus, AlertTriangle, Info, Route } from "lucide-react";

interface TransportHeroProps {
  // Urbano
  linesCount: number;
  companyCount: number;
  totalStops: number;
  reportsCount: number;
  linesWithReports: number;

  // Provincial
  intercityRouteCount?: number;
  intercityCompanyCount?: number;
  intercitySchedulesCount?: number;

  // Modo actual
  viewMode: "urban" | "intercity";
  onModeChange: (mode: "urban" | "intercity") => void;
}

export function TransportHero({
  linesCount,
  companyCount,
  totalStops,
  reportsCount,
  linesWithReports,

  intercityRouteCount = 0,
  intercityCompanyCount = 0,
  intercitySchedulesCount = 0,

  viewMode,
  onModeChange
}: TransportHeroProps) {
  const [showInfo, setShowInfo] = useState(false);

  // -----------------------------------
  // TEXTOS SEGÚN MODO
  // -----------------------------------
  const subtitle =
    viewMode === "urban"
      ? "Líneas, recorridos y paradas en la ciudad"
      : "Rutas provinciales, empresas y horarios";

  const title =
    viewMode === "urban"
      ? "Mapa vivo del transporte en Jujuy"
      : "Servicios provinciales de transporte";

  const infoText =
    viewMode === "urban" ? (
      <>
        Explorá las líneas urbanas, recorridos y paradas geolocalizadas
        para moverte dentro de San Salvador de Jujuy.
      </>
    ) : (
      <>
        Consultá los horarios de las empresas provinciales que conectan la
        capital con La Quiaca, Humahuaca, Iruya y más. Pronto agregaremos
        paradas y mapas completos.
      </>
    );

  // -----------------------------------
  // CLASES FIJAS DE COLOR (Tailwind-safe)
  // -----------------------------------
  const colorClasses: Record<string, string> = {
    sky: "bg-sky-500/15 border-sky-300/70",
    emerald: "bg-emerald-500/15 border-emerald-300/70",
    amber: "bg-amber-500/15 border-amber-300/70",
  };

  // -----------------------------------
  // STATS SEGÚN MODO
  // -----------------------------------
  const stats =
    viewMode === "urban"
      ? [
          { label: "Líneas activas", value: linesCount, color: "sky" },
          { label: "Empresas", value: companyCount, color: "emerald" },
          { label: "Paradas cargadas", value: totalStops, color: "amber" }
        ]
      : [
          { label: "Rutas provinciales", value: intercityRouteCount, color: "sky" },
          { label: "Empresas", value: intercityCompanyCount, color: "emerald" },
          { label: "Horarios cargados", value: intercitySchedulesCount, color: "amber" }
        ];

  return (
    <section className="grid gap-6 md:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)] items-stretch">

      {/* -----------------------------------
         CARD PRINCIPAL
      ----------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-400/40 bg-gradient-to-br from-sky-500/20 via-background to-background p-6 md:p-8 shadow-[0_0_40px_rgba(56,189,248,0.35)]">
        <div className="absolute -right-20 -top-10 h-40 w-40 rounded-full bg-sky-400/30 blur-2xl" />

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/25 border border-sky-300/60">
            {viewMode === "urban" ? (
              <Bus className="h-5 w-5 text-black-50" />
            ) : (
              <Route className="h-5 w-5 text-black-50" />
            )}
          </div>

          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-[0.2em] text-black-100/80">
              Transporte público
            </p>
            <p className="text-xs text-black-100/70">{subtitle}</p>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black-50 mb-4">
          {title}
        </h1>

        {/* SWITCH MODO */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => onModeChange("urban")}
            className={`px-3 py-1.5 rounded-xl text-xs md:text-sm border transition
              ${
                viewMode === "urban"
                  ? "bg-white text-black shadow"
                  : "bg-white/10 text-black-50 hover:bg-white/20"
              }`}
          >
            Urbano
          </button>

          <button
            onClick={() => onModeChange("intercity")}
            className={`px-3 py-1.5 rounded-xl text-xs md:text-sm border transition
              ${
                viewMode === "intercity"
                  ? "bg-white text-black shadow"
                  : "bg-white/10 text-black-50 hover:bg-white/20"
              }`}
          >
            Provincial
          </button>
        </div>

        {/* TOGGLE INFO */}
        <button
          type="button"
          onClick={() => setShowInfo((v) => !v)}
          className="text-[11px] md:text-xs text-black-50/80 underline-offset-2 hover:underline mb-4 inline-flex items-center gap-1"
        >
          {showInfo ? "Ocultar explicación" : "Ver cómo funciona"}
          <span className={`transition-transform ${showInfo ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>

        {/* TEXTO EXPLICATIVO */}
        {showInfo && (
          <p className="text-sm md:text-base text-black-50/85 max-w-xl mb-4">
            {infoText}
          </p>
        )}

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-3 ${colorClasses[s.color]}`}
            >
              <p className="text-[11px] text-black-50 mb-1">{s.label}</p>
              <p className="text-lg font-semibold text-black-50">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* -----------------------------------
         PANEL LATERAL
      ----------------------------------- */}
      <div className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-5 md:p-6 flex flex-col justify-between gap-5">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 mt-0.5 text-primary" />

            <div className="space-y-1 text-sm">
              {viewMode === "urban" ? (
                showInfo ? (
                  <>
                    <p>
                      Cada línea incluye su recorrido base, paradas y reportes
                      activos enviados por la comunidad.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cargamos y mejoramos los datos de forma progresiva.
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Tocá “Ver cómo funciona” para entender el mapa urbano.
                  </p>
                )
              ) : (
                <p className="text-xs text-muted-foreground">
                  Mostramos horarios y rutas provinciales. Los mapas estarán disponibles próximamente.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-[11px] text-muted-foreground">
          {viewMode === "urban" ? (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>
                {reportsCount > 0
                  ? `${linesWithReports} líneas con reportes activos`
                  : "Sin reportes activos en este momento"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Route className="h-3.5 w-3.5 text-sky-500" />
              <span>
                Información preliminar. Más detalles de rutas se agregarán pronto.
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
