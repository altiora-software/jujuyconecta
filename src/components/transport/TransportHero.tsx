import { useState } from "react";
import { Bus, AlertTriangle, Info } from "lucide-react";

interface TransportHeroProps {
  linesCount: number;
  companyCount: number;
  totalStops: number;
  reportsCount: number;
  linesWithReports: number;
}

export function TransportHero({
  linesCount,
  companyCount,
  totalStops,
  reportsCount,
  linesWithReports,
}: TransportHeroProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <section className="grid gap-6 md:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)] items-stretch">
      {/* Card principal */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-400/40 bg-gradient-to-br from-sky-500/20 via-background to-background p-6 md:p-8 shadow-[0_0_40px_rgba(56,189,248,0.35)]">
        <div className="absolute -right-20 -top-10 h-40 w-40 rounded-full bg-sky-400/30 blur-2xl" />
        <div className="flex items-center gap-3 mb-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/25 border border-sky-300/60">
            <Bus className="h-5 w-5 text-black-50" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-[0.2em] text-black-100/80">
              Transporte público
            </p>
            <p className="text-xs text-black-100/70">
              Líneas, recorridos y paradas en Jujuy
            </p>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black-50 mb-2">
          Mapa vivo del transporte en Jujuy
        </h1>

        {/* Toggle de explicación */}
        <button
          type="button"
          onClick={() => setShowInfo((v) => !v)}
          className="text-[11px] md:text-xs text-black-50/80 underline-offset-2 hover:underline mb-2 inline-flex items-center gap-1"
        >
          {showInfo ? "Ocultar explicación" : "Ver cómo usar este mapa"}
          <span className={`transition-transform ${showInfo ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>

        {/* Texto que se muestra solo si el usuario lo pide */}
        {showInfo && (
          <p className="text-sm md:text-base text-black-50/85 max-w-xl mb-4">
            Explorá las empresas, líneas y paradas de colectivos para saber qué te lleva
            de un punto a otro. Podés usarlo si vivís en Jujuy o si estás visitando la
            provincia por primera vez.
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-2xl border border-sky-300/70 bg-sky-500/15 p-3">
            <p className="text-[11px] text-black-50 mb-1">Líneas activas</p>
            <p className="text-lg font-semibold text-black-50">
              {linesCount}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-300/70 bg-emerald-500/15 p-3">
            <p className="text-[11px] text-black-50 mb-1">Empresas</p>
            <p className="text-lg font-semibold text-black-50">
              {companyCount}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-300/70 bg-amber-500/15 p-3">
            <p className="text-[11px] text-amber-50 mb-1">Paradas cargadas</p>
            <p className="text-lg font-semibold text-amber-50">
              {totalStops}
            </p>
          </div>
        </div>
      </div>

      {/* Panel lateral */}
      <div className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-5 md:p-6 flex flex-col justify-between gap-5">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 mt-0.5 text-primary" />
            <div className="space-y-1 text-sm">
              {/* Solo mostramos el texto largo si showInfo está activo */}
              {showInfo ? (
                <>
                  <p>
                    Cada línea muestra su recorrido base, paradas y reportes activos
                    de la comunidad. Podés verla en el mapa o abrir el detalle
                    completo.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Estamos cargando y mejorando los recorridos de forma progresiva.
                    Algunas líneas pueden no tener aún todas las paradas geolocalizadas.
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Tocá “Ver cómo usar este mapa” si querés ver una explicación más
                  detallada.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>
              {reportsCount > 0
                ? `${linesWithReports} líneas con reportes activos`
                : "Sin reportes activos en este momento"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
