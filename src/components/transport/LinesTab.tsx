import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Bus,
  MapPin,
  Route as RouteIcon,
  Info,
  Clock,
  ChevronDown,
} from "lucide-react";
import {
  TransportLine,
  TransportStop,
  TransportRawStop,
  TransportReport,
  IntercityRouteUI,
} from "./types";

interface LinesTabProps {
  // URBANO
  lines: TransportLine[];
  filteredLines: TransportLine[];
  stops: TransportStop[];
  rawStops: TransportRawStop[];
  reports: TransportReport[];
  companyNames: string[];
  selectedCompanyName?: string | null;
  setSelectedCompanyName: (name: string | null) => void;
  setSelectedLineId: (id: string) => void;
  setActiveTab: (tab: "lines" | "map" | "reports") => void;
  openDetails: (line: TransportLine) => void;

  // MODO ACTUAL
  viewMode: "urban" | "intercity";

  // PROVINCIAL
  intercityRoutes?: IntercityRouteUI[]; // rutas provinciales ya procesadas en el hook
}

function formatTimesSummary(times: string[]): string {
  if (!times || times.length === 0) return "Sin horarios cargados";
  if (times.length <= 4) return times.join(" · ");
  const extra = times.length - 4;
  return `${times.slice(0, 4).join(" · ")}  (+${extra} más)`;
}

export function LinesTab({
  lines,
  filteredLines,
  stops,
  rawStops,
  reports,
  companyNames,
  selectedCompanyName,
  setSelectedCompanyName,
  setSelectedLineId,
  setActiveTab,
  openDetails,
  viewMode,
  intercityRoutes = [],
}: LinesTabProps) {
  // estado común, no puede ser condicional
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  // ---------------------------
  // MODO PROVINCIAL
  // ---------------------------
  if (viewMode === "intercity") {
    const visibleRoutes = selectedCompanyName
      ? intercityRoutes.filter(
          (r) => r.company_name === selectedCompanyName
        )
      : intercityRoutes;

    const intercityCompanyNames = Array.from(
      new Set(intercityRoutes.map((r) => r.company_name))
    );

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                <RouteIcon className="h-5 w-5 text-primary" />
                Rutas provinciales por empresa
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Consultá los servicios que salen de San Salvador de Jujuy hacia
                el norte de la provincia, con horarios por empresa.
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground text-right max-w-xs">
              Elegí una empresa y abrí “Ver todos los horarios” para ver cada
              salida diferenciada entre días de semana y fines de semana.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={!selectedCompanyName ? "default" : "outline"}
              onClick={() => setSelectedCompanyName(null)}
              className="rounded-full text-xs"
            >
              Todas las empresas
            </Button>

            {intercityCompanyNames.map((companyName) => (
              <Button
                key={companyName}
                size="sm"
                variant={
                  selectedCompanyName === companyName ? "default" : "outline"
                }
                onClick={() => setSelectedCompanyName(companyName)}
                className="rounded-full text-xs"
              >
                {companyName}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleRoutes.map((route) => {
            const totalWeekday = route.weekday_times.length;
            const totalWeekend = route.weekend_times.length;
            const total = totalWeekday + totalWeekend;
            const isExpanded = expandedRouteId === route.id;

            return (
              <article
                key={route.id}
                className="group relative rounded-3xl border bg-gradient-to-br from-sky-500/6 via-background to-emerald-500/6 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-transform duration-200"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <CardTitle className="text-base md:text-lg leading-snug">
                          {route.origin_city} → {route.destination_city}
                        </CardTitle><br/>
                        <Badge
                          variant="secondary"
                          className="text-[11px] px-2 py-0.5 bg-gradient-to-br from-green-100/6 via-background to-green-500/6"
                        >
                          {route.company_name}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs md:text-sm line-clamp-2">
                        {route.notes ||
                          "Paradas y mapa provinciales en carga. Los horarios ya están disponibles."}
                      </CardDescription>
                    </div>
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground text-[11px] uppercase tracking-wide">
                          Lunes a viernes
                        </span>
                        <p className="text-xs md:text-sm">
                          {formatTimesSummary(route.weekday_times)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground text-[11px] uppercase tracking-wide">
                          Sábados y domingos
                        </span>
                        <p className="text-xs md:text-sm">
                          {formatTimesSummary(route.weekend_times)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Panel de horarios completos */}
                  {isExpanded && (
                    <div className="mt-3 rounded-2xl bg-muted/60 p-3 text-[11px] md:text-xs space-y-3">
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Todos los horarios de salida</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                            Lunes a viernes
                          </p>
                          {route.weekday_times.length === 0 ? (
                            <p className="text-muted-foreground">
                              Sin horarios cargados.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {route.weekday_times.map((t) => (
                                <span
                                  key={t}
                                  className="px-2 py-0.5 rounded-full bg-background border text-[11px]"
                                >
                                  {t} hs
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                            Sábados y domingos
                          </p>
                          {route.weekend_times.length === 0 ? (
                            <p className="text-muted-foreground">
                              Sin horarios cargados.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {route.weekend_times.map((t) => (
                                <span
                                  key={t}
                                  className="px-2 py-0.5 rounded-full bg-background border text-[11px]"
                                >
                                  {t} hs
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 flex items-center justify-between border-t border-border/60 text-[11px] text-muted-foreground">
                    <span>
                      Sale desde{" "}
                      <strong className="text-foreground">
                        {route.origin_city}
                      </strong>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-[11px] inline-flex items-center gap-1"
                      onClick={() =>
                        setExpandedRouteId((prev) =>
                          prev === route.id ? null : route.id
                        )
                      }
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {isExpanded
                        ? "Ocultar horarios"
                        : "Ver todos los horarios"}
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </CardContent>
              </article>
            );
          })}

          {visibleRoutes.length === 0 && (
            <Card className="col-span-full rounded-3xl border-dashed">
              <CardContent className="p-8 text-center text-sm text-muted-foreground space-y-2">
                <Bus className="h-10 w-10 mx-auto text-muted-foreground mb-1" />
                <p>No hay rutas provinciales para esta empresa todavía.</p>
                <p className="text-xs">
                  Probá seleccionar otra empresa o volver a ver todas las rutas.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------
  // MODO URBANO (LO QUE YA TENÍAS)
  // ---------------------------
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <RouteIcon className="h-5 w-5 text-primary" />
              Líneas por empresa
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Filtrá por empresa o explorá todas las líneas juntas.
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Tocá una línea para ver detalles o verla en el mapa
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={!selectedCompanyName ? "default" : "outline"}
            onClick={() => setSelectedCompanyName(null)}
            className="rounded-full text-xs"
          >
            Todas las empresas
          </Button>

          {companyNames.map((companyName) => (
            <Button
              key={companyName}
              size="sm"
              variant={
                selectedCompanyName === companyName ? "default" : "outline"
              }
              onClick={() => setSelectedCompanyName(companyName)}
              className="rounded-full text-xs"
            >
              {companyName}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredLines.map((line) => {
          const lineStops = stops.filter((s) => s.line_id === line.id);
          const lineRawStops = rawStops.filter((s) => s.line_id === line.id);
          const lineReports = reports.filter((r) => r.line_id === line.id);

          const firstStop = lineRawStops.length
            ? lineRawStops[0].stop_name
            : null;
          const lastStop = lineRawStops.length
            ? lineRawStops[lineRawStops.length - 1].stop_name
            : null;

          return (
            <article
              key={line.id}
              className="group relative rounded-3xl border bg-gradient-to-br from-sky-500/6 via-background to-emerald-500/6 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-transform duration-200"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      <div
                        className="w-4 h-4 rounded-full border border-border shadow-inner"
                        style={{ backgroundColor: line.color }}
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <CardTitle className="text-base md:text-lg leading-snug">
                          Línea {line.number}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="text-[11px] px-2 py-0.5"
                        >
                          {line.name}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs md:text-sm line-clamp-2">
                        {line.route_description ||
                          "Recorrido en carga y validación"}
                      </CardDescription>
                    </div>
                  </div>

                  <Bus className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="space-y-2 text-xs md:text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <RouteIcon className="h-4 w-4 mt-0.5" />
                    {firstStop && lastStop ? (
                      <span>
                        Recorrido base: <strong>{firstStop}</strong> →{" "}
                        <strong>{lastStop}</strong>
                      </span>
                    ) : (
                      <span>Recorrido base no disponible aún</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[11px]">
                      {lineRawStops.length || lineStops.length} paradas
                      registradas
                    </Badge>
                    {lineReports.length > 0 ? (
                      <Badge variant="destructive" className="text-[11px]">
                        {lineReports.length} reporte
                        {lineReports.length > 1 && "s"} activo
                        {lineReports.length > 1 && "s"}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[11px]">
                        Sin reportes
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-border/60">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => openDetails(line)}
                  >
                    <Info className="h-3.5 w-3.5 mr-1" />
                    Detalles
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      setSelectedLineId(line.id);
                      setActiveTab("map");
                    }}
                  >
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    Ver en mapa
                  </Button>
                </div>
              </CardContent>
            </article>
          );
        })}

        {filteredLines.length === 0 && (
          <Card className="col-span-full rounded-3xl border-dashed">
            <CardContent className="p-8 text-center text-sm text-muted-foreground space-y-2">
              <Bus className="h-10 w-10 mx-auto text-muted-foreground mb-1" />
              <p>No hay líneas registradas para esta empresa todavía.</p>
              <p className="text-xs">
                Probá seleccionar otra empresa o volver a ver todas las líneas.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
