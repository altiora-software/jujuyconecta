import { Layout } from "@/components/layout/Layout";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { TransportMap } from "@/components/transport/TransportMap";
import { Bus, Clock, AlertTriangle, Plus, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransportLine {
  id: string;
  name: string; // acá está la empresa: "El Urbano", "San Jorge", etc
  number: string;
  color: string;
  route_description: string | null;
  active: boolean;
}

interface TransportStop {
  id: string;
  line_id: string;
  name: string;
  latitude: number;
  longitude: number;
  order_index: number;
}

interface TransportRawStop {
  id: string;
  line_id: string;
  direction: string;
  order_index: number;
  stop_name: string;
  direccion: string | null;
}

interface TransportReport {
  id: string;
  line_id: string;
  message: string;
  severity: "low" | "medium" | "high";
  status: "active" | "resolved" | "dismissed";
  created_at: string;
  transport_lines: TransportLine;
}

export default function Transport() {
  const [lines, setLines] = useState<TransportLine[]>([]);
  const [stops, setStops] = useState<TransportStop[]>([]);
  const [rawStops, setRawStops] = useState<TransportRawStop[]>([]);
  const [reports, setReports] = useState<TransportReport[]>([]);

  const [selectedLineId, setSelectedLineId] = useState<string>();
  const [selectedCompanyName, setSelectedCompanyName] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<"lines" | "map" | "reports">(
    "lines",
  );

  // Modal de detalles
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLine, setDetailsLine] = useState<TransportLine | null>(null);

  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [linesRes, stopsRes, rawStopsRes, reportsRes] = await Promise.all([
        supabase
          .from("transport_lines")
          .select("*")
          .eq("active", true)
          .order("number"),
        supabase
          .from("transport_stops")
          .select("*")
          .order("order_index"),
        supabase
          .from("transport_raw_stops")
          .select("id,line_id,direction,order_index,stop_name,direccion")
          .order("order_index"),
        supabase
          .from("transport_reports")
          .select(`*, transport_lines (*)`)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (linesRes.error) throw linesRes.error;
      if (stopsRes.error) throw stopsRes.error;
      if (rawStopsRes.error) throw rawStopsRes.error;
      if (reportsRes.error) throw reportsRes.error;

      setLines(linesRes.data || []);
      setStops(stopsRes.data || []);
      setRawStops(rawStopsRes.data || []);
      setReports((reportsRes.data as TransportReport[]) || []);
    } catch (error: any) {
      console.error("Error fetching transport data:", error);
      toast({
        title: "Error",
        description:
          error?.message ||
          "No se pudo cargar la información de transporte.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "outline" as const;
      case "low":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Baja";
      default:
        return "Media";
    }
  };

  const openDetails = (line: TransportLine) => {
    setDetailsLine(line);
    setDetailsOpen(true);
  };

  // Empresas derivadas de transport_lines.name
  const companyNames = useMemo(() => {
    const setNames = new Set<string>();
    for (const l of lines) {
      if (l.name) setNames.add(l.name);
    }
    return Array.from(setNames).sort((a, b) => a.localeCompare(b));
  }, [lines]);

  // Líneas filtradas por empresa seleccionada
  const filteredLines = useMemo(() => {
    if (!selectedCompanyName) return lines;
    return lines.filter((l) => l.name === selectedCompanyName);
  }, [lines, selectedCompanyName]);

  // Paradas crudas agrupadas por sentido para la línea seleccionada
  const detailsStopsByDirection = useMemo(() => {
    if (!detailsLine) return {};

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
  }, [detailsLine, rawStops]);

  const totalRawStopsForLine = useMemo(() => {
    if (!detailsLine) return 0;
    return rawStops.filter((s) => s.line_id === detailsLine.id).length;
  }, [detailsLine, rawStops]);

  const detailsReports = useMemo(() => {
    if (!detailsLine) return [];
    return reports.filter((r) => r.line_id === detailsLine.id);
  }, [detailsLine, reports]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-64 animate-pulse" />
            <div className="h-4 bg-muted rounded w-96 animate-pulse" />
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Transporte Público
          </h1>
          <p className="text-muted-foreground">
            Empresas de colectivos, líneas, paradas y reportes.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lines">Líneas</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          {/* LÍNEAS / EMPRESAS */}
          <TabsContent value="lines" className="space-y-6">
            {/* Filtros de empresas */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">
                Empresas de colectivos que llegan
              </h2>
              <p className="text-sm text-muted-foreground">
                Elegí una empresa para ver solo las líneas que opera, o
                mostralas todas.
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={!selectedCompanyName ? "default" : "outline"}
                  onClick={() => setSelectedCompanyName(undefined)}
                >
                  Todas las empresas
                </Button>

                {companyNames.map((companyName) => (
                  <Button
                    key={companyName}
                    size="sm"
                    variant={
                      selectedCompanyName === companyName
                        ? "default"
                        : "outline"
                    }
                    onClick={() => setSelectedCompanyName(companyName)}
                  >
                    {companyName}
                  </Button>
                ))}
              </div>
            </div>

            {/* Grid de líneas filtradas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLines.map((line) => {
                const lineStops = stops.filter((s) => s.line_id === line.id);
                const lineRawStops = rawStops.filter(
                  (s) => s.line_id === line.id,
                );
                const lineReports = reports.filter(
                  (r) => r.line_id === line.id,
                );

                const firstStop = lineRawStops.length
                  ? lineRawStops[0].stop_name
                  : null;
                const lastStop = lineRawStops.length
                  ? lineRawStops[lineRawStops.length - 1].stop_name
                  : null;

                return (
                  <Card
                    key={line.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: line.color }}
                          />
                          Línea {line.number}
                        </CardTitle>
                        <Bus className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardDescription>
                        Empresa: {line.name}
                        {line.route_description && (
                          <span className="block text-xs text-muted-foreground mt-1">
                            {line.route_description}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-xs text-muted-foreground">
                          {firstStop && lastStop ? (
                            <span>
                              Recorrido base:{" "}
                              <strong>{firstStop}</strong> →{" "}
                              <strong>{lastStop}</strong>
                            </span>
                          ) : (
                            <span>Recorrido base no disponible</span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {lineRawStops.length || lineStops.length} paradas
                          </Badge>
                          {lineReports.length > 0 ? (
                            <Badge variant="destructive" className="text-xs">
                              {lineReports.length} reporte(s)
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Sin reportes
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Button size="sm" onClick={() => openDetails(line)}>
                            <Info className="h-4 w-4 mr-2" />
                            Ver detalles
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedLineId(line.id);
                              setActiveTab("map");
                            }}
                          >
                            Ver en mapa
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredLines.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-6 text-center text-sm text-muted-foreground">
                    No hay líneas registradas para esta empresa todavía.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* MAPA */}
          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Recorridos</CardTitle>
                <CardDescription>
                  Visualizá las paradas de colectivos en Jujuy
                  {selectedLineId && (
                    <>
                      {" "}
                      — Mostrando: Línea{" "}
                      {lines.find((l) => l.id === selectedLineId)?.number}
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransportMap
                  lines={lines}
                  stops={stops}
                  selectedLineId={selectedLineId}
                  onLineSelect={setSelectedLineId}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* REPORTES */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Reportes activos</h3>
              <Button size="sm" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo reporte
              </Button>
            </div>

            <div className="space-y-4">
              {reports.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No hay reportes activos
                    </p>
                  </CardContent>
                </Card>
              ) : (
                reports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getSeverityColor(report.severity)}>
                              {getSeverityText(report.severity)}
                            </Badge>
                            <span className="text-sm font-medium">
                              Línea {report.transport_lines.number}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{report.message}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(
                              report.created_at,
                            ).toLocaleString("es-AR")}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* MODAL DETALLES DE LÍNEA */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
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
            <DialogDescription>
              {detailsLine?.route_description
                ? `Recorrido: ${detailsLine.route_description}`
                : "Información del recorrido, paradas y reportes"}
            </DialogDescription>
          </DialogHeader>

          {detailsLine && (
            <div className="space-y-4">
              {/* Resumen */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Resumen</h4>
                <p className="text-sm text-muted-foreground">
                  Empresa: {detailsLine.name}
                </p>
                {detailsLine.route_description && (
                  <p className="text-sm text-muted-foreground">
                    Recorrido: {detailsLine.route_description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {totalRawStopsForLine} paradas
                  </Badge>
                  <Badge
                    variant={
                      detailsReports.length ? "destructive" : "secondary"
                    }
                  >
                    {detailsReports.length
                      ? `${detailsReports.length} reporte(s)`
                      : "Sin reportes"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Paradas */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Paradas (ordenadas)</h4>
                {Object.keys(detailsStopsByDirection).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay paradas registradas.
                  </p>
                ) : (
                  <div className="max-h-64 overflow-auto rounded border divide-y">
                    {Object.entries(detailsStopsByDirection).map(
                      ([direction, stopsForDir]) => (
                        <div key={direction} className="p-2 space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground">
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
                                  className="text-xs text-primary underline"
                                >
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

              {/* Reportes */}
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
                        className="text-sm p-2 rounded border space-y-1"
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

              {/* CTA ver en mapa */}
              <div className="pt-1">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    setSelectedLineId(detailsLine.id);
                    setActiveTab("map");
                    setDetailsOpen(false);
                  }}
                >
                  Ver esta línea en el mapa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
