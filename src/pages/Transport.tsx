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
import {
  Bus,
  Clock,
  AlertTriangle,
  Plus,
  Info,
  MapPin,
  Route as RouteIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransportLine {
  id: string;
  name: string;
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
  latitude: string | null;
  longitude: string | null;
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
  const [selectedCompanyName, setSelectedCompanyName] = useState<
    string | undefined
  >();
  const [activeTab, setActiveTab] = useState<"lines" | "map" | "reports">(
    "lines",
  );

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLine, setDetailsLine] = useState<TransportLine | null>(null);

  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [linesRes, rawStopsRes, reportsRes] = await Promise.all([
        supabase
          .from("transport_lines")
          .select("*")
          .eq("active", true)
          .order("number"),
        supabase
          .from("transport_raw_stops")
          .select(
            "id,line_id,direction,order_index,stop_name,direccion,latitude,longitude",
          )
          .order("order_index"),
        supabase
          .from("transport_reports")
          .select(`*, transport_lines (*)`)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (linesRes.error) throw linesRes.error;
      if (rawStopsRes.error) throw rawStopsRes.error;
      if (reportsRes.error) throw reportsRes.error;

      const linesMapped: TransportLine[] = (linesRes.data || []).map(
        (l: any) => ({
          id: l.id,
          name: l.name,
          number: l.number,
          color: l.color,
          route_description: l.route_description,
          active: l.active,
        }),
      );

      const rawStopsData = (rawStopsRes.data || []) as any[];

      const stopsMapped: TransportStop[] = rawStopsData
        .filter((s) => s.latitude && s.longitude)
        .map((s) => ({
          id: s.id as string,
          line_id: s.line_id as string,
          name: s.stop_name as string,
          latitude: Number(s.latitude),
          longitude: Number(s.longitude),
          order_index: s.order_index as number,
        }));

      const rawStopsMapped: TransportRawStop[] = rawStopsData.map((s) => ({
        id: s.id as string,
        line_id: s.line_id as string,
        direction: s.direction as string,
        order_index: s.order_index as number,
        stop_name: s.stop_name as string,
        direccion: s.direccion as string | null,
        latitude: s.latitude as string | null,
        longitude: s.longitude as string | null,
      }));

      const reportsMapped = (reportsRes.data || []) as TransportReport[];

      setLines(linesMapped);
      setStops(stopsMapped);
      setRawStops(rawStopsMapped);
      setReports(reportsMapped);

      if (!selectedLineId && linesMapped.length > 0) {
        const lineWithStops = linesMapped.find((line) =>
          stopsMapped.some((s) => s.line_id === line.id),
        );
        if (lineWithStops) {
          setSelectedLineId(lineWithStops.id);
        }
      }
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

  const companyNames = useMemo(() => {
    const setNames = new Set<string>();
    for (const l of lines) {
      if (l.name) setNames.add(l.name);
    }
    return Array.from(setNames).sort((a, b) => a.localeCompare(b));
  }, [lines]);

  const filteredLines = useMemo(() => {
    if (!selectedCompanyName) return lines;
    return lines.filter((l) => l.name === selectedCompanyName);
  }, [lines, selectedCompanyName]);

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

  const totalStops = rawStops.length;
  const linesWithReports = new Set(reports.map((r) => r.line_id)).size;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <div className="grid gap-6">
            <div className="h-32 rounded-3xl bg-gradient-to-br from-sky-500/10 via-emerald-500/5 to-background animate-pulse" />
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-3xl bg-muted/70 border border-border/60 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-sky-500/12 via-background to-background" />
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
          {/* Hero */}
          <section className="grid gap-6 md:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)] items-stretch">
            <div className="relative overflow-hidden rounded-3xl border border-sky-400/40 bg-gradient-to-br from-sky-500/20 via-background to-background p-6 md:p-8 shadow-[0_0_40px_rgba(56,189,248,0.35)]">
              <div className="absolute -right-20 -top-10 h-40 w-40 rounded-full bg-sky-400/30 blur-2xl" />
              <div className="flex items-center gap-3 mb-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/25 border border-sky-300/60">
                  <Bus className="h-5 w-5 text-black-50" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs uppercase tracking-[0.2em] text-black-100/80">
                    Transporte Público
                  </p>
                  <p className="text-xs text-black-100/70">
                    Líneas, recorridos y paradas en Jujuy
                  </p>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black-50 mb-3">
                Mapa vivo del transporte en Jujuy
              </h1>
              <p className="text-sm md:text-base text-black-50/85 max-w-xl mb-4">
                Explorá las empresas, líneas y paradas de colectivos. Ideal
                para moverte por la ciudad si sos de Jujuy o estás visitando
                la provincia por primera vez.
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-2xl border border-sky-300/70 bg-sky-500/15 p-3">
                  <p className="text-[11px] text-black-50 mb-1">
                    Líneas activas
                  </p>
                  <p className="text-lg font-semibold text-black-50">
                    {lines.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-300/70 bg-emerald-500/15 p-3">
                  <p className="text-[11px] text-black-50 mb-1">
                    Empresas
                  </p>
                  <p className="text-lg font-semibold text-black-50">
                    {companyNames.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-300/70 bg-amber-500/15 p-3">
                  <p className="text-[11px] text-amber-50 mb-1">
                    Paradas cargadas
                  </p>
                  <p className="text-lg font-semibold text-amber-50">
                    {totalStops}
                  </p>
                </div>
              </div>
            </div>

            {/* Panel lateral pequeño */}
            <div className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-5 md:p-6 flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="space-y-1 text-sm">
                    <p>
                      Cada línea muestra su recorrido base, paradas y reportes
                      activos de la comunidad. Podés verla en el mapa o abrir
                      el detalle completo.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Estamos cargando y mejorando los recorridos de forma
                      progresiva. Algunas líneas pueden no tener aún todas las
                      paradas geolocalizadas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <span>
                    {reports.length > 0
                      ? `${linesWithReports} líneas con reportes activos`
                      : "Sin reportes activos en este momento"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs principales */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="space-y-6"
          >
            <TabsList className="flex w-full flex-wrap gap-2 bg-muted/30 p-1 rounded-2xl">
              <TabsTrigger
                value="lines"
                className="text-xs md:text-sm px-3 py-1.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Líneas y empresas
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="text-xs md:text-sm px-3 py-1.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Mapa interactivo
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="text-xs md:text-sm px-3 py-1.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Reportes en circulación
              </TabsTrigger>
            </TabsList>

            {/* LÍNEAS / EMPRESAS */}
            <TabsContent value="lines" className="space-y-6">
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
                        selectedCompanyName === companyName
                          ? "default"
                          : "outline"
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
                                Recorrido base:{" "}
                                <strong>{firstStop}</strong> →{" "}
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
                      <p>
                        No hay líneas registradas para esta empresa todavía.
                      </p>
                      <p className="text-xs">
                        Probá seleccionar otra empresa o volver a ver todas las
                        líneas.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* MAPA */}
            <TabsContent value="map">
              <Card className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Mapa de recorridos
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Visualizá las paradas de colectivos en Jujuy
                    {selectedLineId && (
                      <>
                        {" "}
                        · Mostrando: Línea{" "}
                        {lines.find((l) => l.id === selectedLineId)?.number}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden border">
                    <TransportMap
                      lines={lines}
                      stops={stops}
                      selectedLineId={selectedLineId}
                      onLineSelect={setSelectedLineId}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span className="inline-flex h-3 w-3 rounded-full bg-primary/70" />
                    Seleccioná una línea en la lista o sobre el mapa para ver
                    su recorrido.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* REPORTES */}
            <TabsContent value="reports" className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Reportes activos
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Demoras, desvíos y problemas reportados por la comunidad.
                  </p>
                </div>
                <Button size="sm" disabled className="rounded-full text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Nuevo reporte (próximamente)
                </Button>
              </div>

              <div className="space-y-4">
                {reports.length === 0 ? (
                  <Card className="rounded-3xl border-dashed">
                    <CardContent className="p-8 text-center">
                      <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No hay reportes activos ahora mismo.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cuando haya desvíos o irregularidades, los vas a ver
                        acá agrupados por línea.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  reports.map((report) => (
                    <Card
                      key={report.id}
                      className="rounded-3xl border bg-gradient-to-r from-destructive/5 via-background to-background"
                    >
                      <CardContent className="p-4 md:p-5">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={getSeverityColor(report.severity)}>
                                {getSeverityText(report.severity)}
                              </Badge>
                              <span className="text-xs md:text-sm font-medium">
                                Línea {report.transport_lines.number} ·{" "}
                                {report.transport_lines.name}
                              </span>
                            </div>
                            <p className="text-sm">{report.message}</p>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
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
      </div>

      {/* MODAL DETALLES DE LÍNEA */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
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
                    {totalRawStopsForLine} paradas registradas
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
                <h4 className="text-sm font-semibold">Paradas (ordenadas)</h4>
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
