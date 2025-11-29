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
import {
  Shield,
  AlertTriangle,
  Clock,
  Eye,
  Share2,
  Link as LinkIcon,
  AlertOctagon,
  WifiOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  category:
    | "phishing"
    | "estafas"
    | "grooming"
    | "fraudes"
    | "malware"
    | "robos"
    | "estafas_callejeras"
    | "ciberseguridad"
    | "documentos"
    | "otros"
    | string;
  severity: "low" | "medium" | "high" | "critical" | string;
  active: boolean;
  featured: boolean;
  created_at: string;
  image_url?: string | null;
  prevention?: string | null;
}

export default function Security() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [loading, setLoading] = useState(true);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(
    null
  );

  const { toast } = useToast();

  const categories = [
    { value: "todas", label: "Todas las categorías" },
    { value: "phishing", label: "Phishing" },
    { value: "estafas", label: "Estafas (genérico)" },
    { value: "grooming", label: "Grooming" },
    { value: "fraudes", label: "Fraudes" },
    { value: "malware", label: "Malware" },
    { value: "robos", label: "Robos y Hurtos" },
    { value: "estafas_callejeras", label: "Estafas Callejeras" },
    { value: "ciberseguridad", label: "Ciberseguridad" },
    { value: "documentos", label: "Documentos y Trámites" },
    { value: "otros", label: "Otros" },
  ];

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("security_alerts")
        .select(
          "id,title,description,category,severity,active,featured,created_at,image_url,prevention"
        )
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setAlerts(data as unknown as SecurityAlert[]);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las alertas de seguridad",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return "destructive" as const;
      case "medium":
        return "outline" as const;
      case "low":
      default:
        return "secondary" as const;
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "critical":
        return "Crítica";
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

  const getSeverityGlow = (severity: string) => {
    switch (severity) {
      case "critical":
        return "from-red-500/30 via-red-600/10 to-background border-red-500/40";
      case "high":
        return "from-orange-500/25 via-orange-600/10 to-background border-orange-400/40";
      case "medium":
        return "from-yellow-400/20 via-yellow-500/5 to-background border-yellow-300/40";
      case "low":
      default:
        return "from-emerald-400/15 via-emerald-500/5 to-background border-emerald-300/40";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "phishing":
        return "🎣";
      case "estafas":
        return "💰";
      case "grooming":
        return "👥";
      case "fraudes":
        return "🚫";
      case "malware":
        return "🦠";
      case "robos":
        return "🕵️";
      case "estafas_callejeras":
        return "🧊";
      case "ciberseguridad":
        return "🛡️";
      case "documentos":
        return "📄";
      default:
        return "⚠️";
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find((c) => c.value === category)?.label || category;
  };

  const filteredAlerts = useMemo(
    () =>
      selectedCategory === "todas"
        ? alerts
        : alerts.filter((alert) => alert.category === selectedCategory),
    [alerts, selectedCategory]
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openDetails = (alert: SecurityAlert) => {
    setSelectedAlert(alert);
    setDetailsOpen(true);
  };

  const shareAlert = async (a: SecurityAlert) => {
    const info =
      `Alerta: ${a.title}\n` +
      `Categoría: ${getCategoryLabel(a.category)}\n` +
      `Gravedad: ${getSeverityText(a.severity)}\n\n` +
      `${a.description}\n` +
      (a.prevention ? `\nPrevención:\n${a.prevention}` : "");
    try {
      if (navigator.share) {
        await navigator.share({
          title: a.title,
          text: info,
          url:
            typeof window !== "undefined"
              ? window.location.href
              : undefined,
        });
      } else {
        await navigator.clipboard.writeText(info);
        toast({
          title: "Copiado",
          description: "Detalles copiados al portapapeles.",
        });
      }
    } catch {
      // usuario canceló
    }
  };

  const renderPrevention = (prevention?: string | null) => {
    if (!prevention) return null;
    const items = prevention
      .split(/\n|•|-|\u2022|\r/)
      .map((s) => s.replace(/^[\s•\-]+/, "").trim())
      .filter(Boolean);

    return (
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-destructive" />
          ¿Cómo prevenirlo?
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <div className="grid gap-6">
            <div className="h-32 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-background animate-pulse" />
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl bg-muted/60 border border-border/60 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const featuredAlerts = alerts.filter((a) => a.featured);

  return (
    <Layout>
      <div className="relative">
        {/* background aura */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-emerald-500/10 via-background to-background" />
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
          {/* Hero */}
          <section className="grid gap-6 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)] items-stretch">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-background to-background p-6 md:p-8 shadow-[0_0_40px_rgba(16,185,129,0.25)]">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl" />
              <div className="flex items-center gap-3 mb-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/40">
                  <Shield className="h-5 w-5 text-black-300" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs uppercase tracking-[0.2em] text-black-300">
                    Centro de Alertas
                  </p>
                  <p className="text-xs text-black-200/80">
                    Jujuy Conecta
                  </p>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black-50 mb-3">
                Seguridad digital y ciudadana en tiempo real
              </h1>
              <p className="text-sm md:text-base text-black-50/80 max-w-xl mb-4">
                Estafas, fraudes, robos, grooming. Acá ves lo que está pasando
                y cómo protegerte, explicado en lenguaje claro para toda la
                familia.
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge
                  variant="outline"
                  className="border-emerald-400/60 bg-emerald-500/10 text-black-100 text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
                  Información verificada
                </Badge>
                <Badge
                  variant="outline"
                  className="border-emerald-400/40 text-black-100 text-xs"
                >
                  Actualizado al {formatDate(alerts[0]?.created_at)}
                </Badge>
              </div>
            </div>

            {/* Filtro + resumen */}
            <div className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 md:p-6 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Filtrar por tipo de riesgo
                  </p>
                  <div className="md:hidden">
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-full bg-background/80">
                        <SelectValue placeholder="Elegí una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Tabs
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    className="hidden md:block"
                  >
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 bg-muted/60">
                      {categories.slice(0, 4).map((c) => (
                        <TabsTrigger
                          key={c.value}
                          value={c.value}
                          className="text-[11px] leading-tight"
                        >
                          {c.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-2xl border border-emerald-300/50 bg-emerald-500/10 p-3">
                    <p className="text-[11px] text-black-100 mb-1">
                      Alertas activas
                    </p>
                    <p className="text-lg font-semibold text-black-50">
                      {alerts.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-orange-300/50 bg-black-500/10 p-3">
                    <p className="text-[11px] text-black-50 mb-1">
                      Riesgo alto o crítico
                    </p>
                    <p className="text-lg font-semibold text-black-50">
                      {
                        alerts.filter((a) =>
                          ["high", "critical"].includes(a.severity)
                        ).length
                      }
                    </p>
                  </div>
                  <div className="rounded-2xl border border-sky-300/50 bg-sky-500/10 p-3">
                    <p className="text-[11px] text-black-50 mb-1">
                      Alertas destacadas
                    </p>
                    <p className="text-lg font-semibold text-black-50">
                      {featuredAlerts.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <WifiOff className="h-3 w-3" />
                <span>
                  Podés leer estas recomendaciones incluso con conexión inestable
                </span>
              </div>
            </div>
          </section>

          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="space-y-6"
          >
            {/* Tabs de categorías extendidas en desktop */}
            <TabsList className="hidden md:flex w-full flex-wrap gap-2 bg-muted/40 p-1 rounded-2xl">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="text-xs px-3 py-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Alertas destacadas como carrusel */}
            {featuredAlerts.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-xl bg-destructive/15 border border-destructive/40">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  </span>
                  Alertas destacadas ahora
                </h2>
                <p className="text-xs text-muted-foreground max-w-xl">
                  Son situaciones que se repiten con frecuencia o tienen impacto
                  fuerte, vale la pena leerlas y comentarlas en familia.
                </p>

                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {featuredAlerts
                    .filter(
                      (a) =>
                        selectedCategory === "todas" ||
                        a.category === selectedCategory
                    )
                    .map((a) => (
                      <article
                        key={a.id}
                        className={`snap-start min-w-[260px] max-w-sm md:max-w-md flex-shrink-0 rounded-3xl border bg-gradient-to-br ${getSeverityGlow(
                          a.severity
                        )} shadow-lg shadow-black/10 overflow-hidden group`}
                      >
                        <div className="relative h-32 md:h-40 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              a.image_url ||
                              "https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=800"
                            }
                            alt={a.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                          <div className="absolute left-4 bottom-3 flex items-center gap-2">
                            <span className="text-xl drop-shadow-sm">
                              {getCategoryIcon(a.category)}
                            </span>
                            <div className="flex gap-1">
                              <Badge
                                variant={getSeverityVariant(a.severity)}
                                className="text-[11px] px-2 py-0.5"
                              >
                                {getSeverityText(a.severity)}
                              </Badge>
                              <Badge className="text-[11px] px-2 py-0.5">
                                Destacada
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4 md:p-5 space-y-3">
                          <div className="space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                              {getCategoryLabel(a.category)}
                            </p>
                            <h3 className="text-base md:text-lg font-semibold line-clamp-2">
                              {a.title}
                            </h3>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-3">
                            {a.description}
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDate(a.created_at)}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => openDetails(a)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                Leer
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 text-xs"
                                onClick={() => shareAlert(a)}
                              >
                                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                                Compartir
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </article>
                    ))}
                  {featuredAlerts.length === 0 && (
                    <div className="text-sm text-muted-foreground py-6">
                      No hay alertas destacadas por ahora
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Todas las alertas con grid responsivo y tarjetas vivas */}
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg md:text-xl font-semibold">
                  Todas las alertas
                  {selectedCategory !== "todas" &&
                    ` · ${getCategoryLabel(selectedCategory)}`}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Tocá una tarjeta para ver el detalle y los pasos de
                  prevención
                </p>
              </div>

              {filteredAlerts.length === 0 ? (
                <Card className="rounded-3xl border-dashed">
                  <CardContent className="p-10 text-center space-y-3">
                    <Shield className="h-10 w-10 mx-auto text-muted-foreground mb-1" />
                    <p className="text-sm font-medium">
                      No hay alertas para mostrar
                    </p>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      {selectedCategory === "todas"
                        ? "En este momento no hay alertas activas registradas en el sistema."
                        : `No se encontraron alertas para la categoría ${getCategoryLabel(
                            selectedCategory
                          )}. Probá con otra categoría.`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredAlerts.map((a) => (
                    <article
                      key={a.id}
                      className={`group relative cursor-pointer rounded-3xl border bg-gradient-to-br ${getSeverityGlow(
                        a.severity
                      )} overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-transform duration-200`}
                      onClick={() => openDetails(a)}
                    >
                      <div className="flex flex-col h-full">
                        {/* imagen arriba, con fallback */}
                        <div className="relative h-28 w-full overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              a.image_url ||
                              "https://images.pexels.com/photos/5380645/pexels-photo-5380645.jpeg?auto=compress&cs=tinysrgb&w=800"
                            }
                            alt={a.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="text-lg">
                              {getCategoryIcon(a.category)}
                            </span>
                            <Badge
                              variant={getSeverityVariant(a.severity)}
                              className="text-[10px] px-2 py-0.5"
                            >
                              {getSeverityText(a.severity)}
                            </Badge>
                          </div>
                          {a.featured && (
                            <div className="absolute top-2 right-2">
                              <Badge className="text-[10px] px-2 py-0.5 bg-emerald-500 text-black-50 border-emerald-300">
                                Destacada
                              </Badge>
                            </div>
                          )}
                        </div>

                        <CardContent className="flex-1 p-4 space-y-3">
                          <div className="space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                              {getCategoryLabel(a.category)}
                            </p>
                            <h3 className="text-base font-semibold line-clamp-2 group-hover:text-foreground">
                              {a.title}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-3">
                            {a.description}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-border/60">
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDate(a.created_at)}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDetails(a);
                                }}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  shareAlert(a);
                                }}
                              >
                                <Share2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <TabsContent value={selectedCategory} />
          </Tabs>
        </div>
      </div>

      {/* Modal de detalles */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {getCategoryLabel(selectedAlert.category)}
                  </span>
                  <span className="text-lg md:text-xl">
                    {selectedAlert.title}
                  </span>
                </DialogTitle>
                <DialogDescription className="flex flex-wrap gap-2 mt-2">
                  <Badge
                    variant={getSeverityVariant(selectedAlert.severity)}
                    className="text-xs"
                  >
                    {getSeverityText(selectedAlert.severity)}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Publicado {formatDate(selectedAlert.created_at)}
                  </Badge>
                  {selectedAlert.featured && (
                    <Badge className="text-xs">Destacada</Badge>
                  )}
                </DialogDescription>
              </DialogHeader>

              {selectedAlert.image_url && (
                <div className="rounded-2xl overflow-hidden border mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedAlert.image_url}
                    alt={selectedAlert.title}
                    className="w-full h-56 object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              <p className="text-sm text-foreground whitespace-pre-line">
                {selectedAlert.description}
              </p>

              {renderPrevention(selectedAlert.prevention)}

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDetailsOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => shareAlert(selectedAlert)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
                {selectedAlert.image_url && (
                  <a
                    href={selectedAlert.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-muted transition"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Ver imagen en grande
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
