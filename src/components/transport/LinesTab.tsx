import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Bus, MapPin, Route as RouteIcon, Info } from "lucide-react";
import {
  TransportLine,
  TransportStop,
  TransportRawStop,
  TransportReport,
} from "./types";

interface LinesTabProps {
  lines: TransportLine[];
  filteredLines: TransportLine[];
  stops: TransportStop[];
  rawStops: TransportRawStop[];
  reports: TransportReport[];
  companyNames: string[];
  selectedCompanyName?: string;
  setSelectedCompanyName: (name: string | undefined) => void;
  setSelectedLineId: (id: string) => void;
  setActiveTab: (tab: "lines" | "map" | "reports") => void;
  openDetails: (line: TransportLine) => void;
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
}: LinesTabProps) {
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
            onClick={() => setSelectedCompanyName(undefined)}
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
                      <Badge
                        variant="destructive"
                        className="text-[11px]"
                      >
                        {lineReports.length} reporte
                        {lineReports.length > 1 && "s"} activo
                        {lineReports.length > 1 && "s"}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-[11px]"
                      >
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
