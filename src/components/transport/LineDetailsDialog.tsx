import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from "@/components/ui/dialog";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Separator } from "@/components/ui/separator";
  import { MapPin, Route as RouteIcon } from "lucide-react";
  import {
    TransportLine,
    TransportRawStop,
    TransportReport,
  } from "./types";
  import { getSeverityColor, getSeverityText } from "./transportUtils";
  
  interface LineDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    detailsLine: TransportLine | null;
    rawStops: TransportRawStop[];
    reports: TransportReport[];
    onSeeOnMap: (lineId: string) => void;
  }
  
  export function LineDetailsDialog({
    open,
    onOpenChange,
    detailsLine,
    rawStops,
    reports,
    onSeeOnMap,
  }: LineDetailsDialogProps) {
    const detailsStopsByDirection = (() => {
      if (!detailsLine) return {} as Record<string, TransportRawStop[]>;
  
      const filtered = rawStops
        .filter((s) => s.line_id === detailsLine.id)
        .sort((a, b) => a.order_index - b.order_index);
  
      return filtered.reduce<Record<string, TransportRawStop[]>>(
        (acc, stop) => {
          if (!acc[stop.direction]) acc[stop.direction] = [];
          acc[stop.direction].push(stop);
          return acc;
        },
        {},
      );
    })();
  
    const totalRawStopsForLine = detailsLine
      ? rawStops.filter((s) => s.line_id === detailsLine.id).length
      : 0;
  
    const detailsReports = detailsLine
      ? reports.filter((r) => r.line_id === detailsLine.id)
      : [];
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailsLine && (
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: detailsLine.color }}
                />
              )}
              {detailsLine
                ? `Línea ${detailsLine.number} · ${detailsLine.name}`
                : "Detalle de línea"}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              {detailsLine?.route_description
                ? `Recorrido: ${detailsLine.route_description}`
                : "Información del recorrido, paradas y reportes"}
            </DialogDescription>
          </DialogHeader>
  
          {detailsLine && (
            <div className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Resumen</h4>
                <p className="text-muted-foreground">
                  Empresa: {detailsLine.name}
                </p>
                {detailsLine.route_description && (
                  <p className="text-muted-foreground">
                    Recorrido: {detailsLine.route_description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {totalRawStopsForLine} paradas cargadas
                  </Badge>
                  <Badge
                    variant={
                      detailsReports.length ? "destructive" : "secondary"
                    }
                  >
                    {detailsReports.length
                      ? `${detailsReports.length} reporte(s) activo(s)`
                      : "Sin reportes"}
                  </Badge>
                </div>
              </div>
  
              <Separator />
  
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Paradas ordenadas</h4>
                {Object.keys(detailsStopsByDirection).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay paradas registradas.
                  </p>
                ) : (
                  <div className="max-h-64 overflow-auto rounded-2xl border divide-y bg-background/70">
                    {Object.entries(detailsStopsByDirection).map(
                      ([direction, stopsForDir]) => (
                        <div key={direction} className="p-2 space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                            <RouteIcon className="h-3.5 w-3.5" />
                            Sentido: {direction}
                          </p>
                          <ul className="divide-y">
                            {stopsForDir.map((s) => (
                              <li
                                key={s.id}
                                className="py-1.5 text-sm flex items-center gap-2 justify-between"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                                  <span className="flex-1">
                                    {s.direccion || s.stop_name}
                                  </span>
                                </div>
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    `${s.direccion || s.stop_name}, San Salvador de Jujuy, Jujuy, Argentina`,
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
                                >
                                  <MapPin className="h-3 w-3" />
                                  Ver en mapa
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
  
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Reportes</h4>
                {detailsReports.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay reportes activos para esta línea.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {detailsReports.map((r) => (
                      <div
                        key={r.id}
                        className="text-sm p-2 rounded-2xl border bg-muted/40 space-y-1"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getSeverityColor(r.severity)}>
                            {getSeverityText(r.severity)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleString("es-AR")}
                          </span>
                        </div>
                        <p className="text-sm">{r.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
  
              <div className="pt-1">
                <Button
                  className="w-full rounded-full"
                  variant="outline"
                  onClick={() => {
                    onSeeOnMap(detailsLine.id);
                  }}
                >
                  Ver esta línea en el mapa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }
  