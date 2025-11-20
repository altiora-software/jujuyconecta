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
  MapPin,
  Users,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  Share2,
  CheckCircle2,
  HeartHandshake,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SocialResource {
  id: string;
  name: string;
  type:
    | "comedor"
    | "merendero"
    | "ong"
    | "centro_salud"
    | "educativo"
    | string;
  description: string | null;
  address: string;
  contact_phone: string | null;
  contact_email: string | null;
  schedule: string | null;
  needs: string[] | null;
  verified: boolean;
  active: boolean;
  created_at: string;
  latitude?: number | null;
  longitude?: number | null;
}

export default function Resources() {
  const [resources, setResources] = useState<SocialResource[]>([]);
  const [selectedType, setSelectedType] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedResource, setSelectedResource] =
    useState<SocialResource | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("social_resources")
        .select("*")
        .eq("active", true)
        .order("verified", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setResources(data as SocialResource[]);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los recursos sociales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      comedor: "Comedor",
      merendero: "Merendero",
      ong: "ONG",
      centro_salud: "Centro de Salud",
      educativo: "Educativo",
    } as const;
    return (labels as any)[type] || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "comedor":
      case "merendero":
        return "🍽️";
      case "ong":
        return "❤️";
      case "centro_salud":
        return "🏥";
      case "educativo":
        return "📚";
      default:
        return "📍";
    }
  };

  const filteredResources = useMemo(
    () =>
      selectedType === "todos"
        ? resources
        : resources.filter((r) => r.type === selectedType),
    [resources, selectedType]
  );

  const resourceTypes = [
    { value: "todos", label: "Todos" },
    { value: "comedor", label: "Comedores" },
    { value: "merendero", label: "Merenderos" },
    { value: "ong", label: "ONGs" },
    { value: "centro_salud", label: "Centros de Salud" },
    { value: "educativo", label: "Educativos" },
  ];

  const buildMapsUrl = (r: SocialResource) => {
    if (r.latitude != null && r.longitude != null) {
      return `https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`;
    }
    const q = encodeURIComponent(r.address || r.name);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  };

  const shareResource = async (r: SocialResource) => {
    const text =
      `Recurso: ${r.name} (${getTypeLabel(r.type)})\n` +
      `Dirección: ${r.address}\n` +
      (r.schedule ? `Horarios: ${r.schedule}\n` : "") +
      `Mapa: ${buildMapsUrl(r)}`;
    const shareData = {
      title: r.name,
      text,
      url:
        typeof window !== "undefined" ? window.location.href : undefined,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Copiado",
          description: "Información copiada al portapapeles.",
        });
      }
    } catch {
      // usuario canceló
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <div className="grid gap-6">
            <div className="h-32 rounded-3xl bg-gradient-to-br from-sky-400/15 via-emerald-500/5 to-background animate-pulse" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-52 rounded-3xl bg-muted/70 border border-border/60 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const verifiedCount = resources.filter((r) => r.verified).length;

  return (
    <Layout>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-sky-500/10 via-background to-background" />
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
          {/* Hero */}
          <section className="grid gap-6 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)] items-stretch">
            <div className="relative overflow-hidden rounded-3xl border border-sky-400/40 bg-gradient-to-br from-sky-500/20 via-background to-background p-6 md:p-8 shadow-[0_0_40px_rgba(56,189,248,0.3)]">
              <div className="absolute -right-16 -top-10 h-40 w-40 rounded-full bg-sky-400/25 blur-2xl" />
              <div className="flex items-center gap-3 mb-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/25 border border-sky-300/60">
                  <HeartHandshake className="h-5 w-5 text-black-100" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs uppercase tracking-[0.2em] text-black-100/80">
                    Red de Apoyo
                  </p>
                  <p className="text-xs text-black-100/70">
                    Comedores, merenderos y ONGs en Jujuy
                  </p>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black-50 mb-3">
                Recursos sociales cerca tuyo
              </h1>
              <p className="text-sm md:text-base text-black-50/85 max-w-xl mb-4">
                Encontrá comedores, merenderos, ONGs y espacios de contención
                verificados en Jujuy. Pensado tanto para quienes necesitan
                ayuda como para quienes quieren sumar manos.
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge
                  variant="outline"
                  className="border-sky-300/60 bg-sky-500/15 text-black-50 text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse mr-2" />
                  {resources.length} recursos activos
                </Badge>
                <Badge
                  variant="outline"
                  className="border-emerald-300/60 bg-emerald-500/10 text-black-100 text-xs"
                >
                  {verifiedCount} verificados por la comunidad
                </Badge>
              </div>
            </div>

            {/* Filtro y métricas */}
            <div className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-5 md:p-6 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Filtrar por tipo de recurso
                  </p>

                  {/* Mobile select */}
                  <div className="md:hidden">
                    <Select
                      value={selectedType}
                      onValueChange={setSelectedType}
                    >
                      <SelectTrigger className="w-full bg-background/80">
                        <SelectValue placeholder="Elegí un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Desktop chips con Tabs */}
                  <Tabs
                    value={selectedType}
                    onValueChange={setSelectedType}
                    className="hidden md:block"
                  >
                    <TabsList className="flex w-full flex-wrap gap-2 bg-muted/40 p-1 rounded-2xl">
                      {resourceTypes.map((type) => (
                        <TabsTrigger
                          key={type.value}
                          value={type.value}
                          className="text-[11px] px-3 py-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                          {type.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-2xl border border-sky-300/70 bg-sky-500/15 p-3">
                    <p className="text-[11px] text-black-50 mb-1">
                      Recursos visibles
                    </p>
                    <p className="text-lg font-semibold text-black-50">
                      {filteredResources.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/70 bg-emerald-500/15 p-3">
                    <p className="text-[11px] text-black-50 mb-1">
                      Con necesidades cargadas
                    </p>
                    <p className="text-lg font-semibold text-black-50">
                      {
                        resources.filter(
                          (r) => r.needs && r.needs.length > 0
                        ).length
                      }
                    </p>
                  </div>
                  <div className="rounded-2xl border border-indigo-300/70 bg-indigo-500/15 p-3">
                    <p className="text-[11px] text-black-50 mb-1">
                      Con contacto directo
                    </p>
                    <p className="text-lg font-semibold text-black-50">
                      {
                        resources.filter(
                          (r) => r.contact_phone || r.contact_email
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>
                  Compartí estos recursos con quien lo necesite o con quien
                  quiera ayudar
                </span>
              </div>
            </div>
          </section>

          {/* Listado principal */}
          <Tabs
            value={selectedType}
            onValueChange={setSelectedType}
            className="space-y-6"
          >
            {/* Chips en desktop (segunda fila) */}
            <TabsList className="hidden md:flex w-full flex-wrap gap-2 bg-muted/30 p-1 rounded-2xl">
              {resourceTypes.map((type) => (
                <TabsTrigger
                  key={type.value}
                  value={type.value}
                  className="text-xs px-3 py-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedType} className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg md:text-xl font-semibold">
                  Recursos
                  {selectedType !== "todos" &&
                    ` · ${resourceTypes.find((t) => t.value === selectedType)?.label}`}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Tocá una tarjeta para ver detalles, contactos y mapa
                </p>
              </div>

              <div className="grid gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredResources.length === 0 ? (
                  <div className="col-span-full">
                    <Card className="rounded-3xl border-dashed">
                      <CardContent className="p-10 text-center space-y-3">
                        <Users className="h-10 w-10 mx-auto text-muted-foreground mb-1" />
                        <p className="text-sm font-medium">
                          No hay recursos registrados para esta categoría
                        </p>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                          Podés probar con otro filtro o volver más tarde mientras
                          seguimos cargando información de la red de ayuda en
                          Jujuy.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  filteredResources.map((resource) => {
                    const hasContact =
                      resource.contact_phone || resource.contact_email;
                    const hasNeeds =
                      resource.needs && resource.needs.length > 0;

                    return (
                      <article
                        key={resource.id}
                        className="group relative cursor-pointer rounded-3xl border bg-gradient-to-br from-sky-500/8 via-background to-emerald-500/5 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-transform duration-200"
                        onClick={() => {
                          setSelectedResource(resource);
                          setDetailsOpen(true);
                        }}
                      >
                        <div className="flex flex-col h-full">
                          <CardHeader className="pb-2 pt-4 px-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2">
                                <span className="text-2xl">
                                  {getTypeIcon(resource.type)}
                                </span>
                                <div>
                                  <CardTitle className="text-base md:text-lg leading-snug line-clamp-2">
                                    {resource.name}
                                  </CardTitle>
                                  <CardDescription className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                                    <Badge
                                      variant={
                                        resource.verified ? "default" : "outline"
                                      }
                                      className="text-[11px] px-2 py-0.5"
                                    >
                                      {resource.verified ? (
                                        <span className="flex items-center gap-1">
                                          <CheckCircle2 className="h-3 w-3" />
                                          Verificado
                                        </span>
                                      ) : (
                                        "Sin verificar"
                                      )}
                                    </Badge>
                                    <span className="text-muted-foreground">
                                      {getTypeLabel(resource.type)}
                                    </span>
                                  </CardDescription>
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="flex-1 px-4 pb-4 space-y-3">
                            {resource.description && (
                              <p className="text-xs md:text-sm text-muted-foreground line-clamp-3">
                                {resource.description}
                              </p>
                            )}

                            <div className="space-y-2 text-xs md:text-sm">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <span>{resource.address}</span>
                              </div>

                              {resource.schedule && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{resource.schedule}</span>
                                </div>
                              )}
                            </div>

                            {hasNeeds && (
                              <div className="pt-2 border-t border-border/60">
                                <p className="text-[11px] font-medium text-muted-foreground mb-1">
                                  Necesidades actuales
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {resource.needs!.slice(0, 4).map((n, i) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-[10px] rounded-full px-2 py-0.5"
                                    >
                                      {n}
                                    </Badge>
                                  ))}
                                  {resource.needs!.length > 4 && (
                                    <span className="text-[10px] text-muted-foreground">
                                      +{resource.needs!.length - 4}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="pt-3 flex items-center justify-between border-t border-dashed border-border/50 mt-1">
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                {hasContact ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Contacto disponible</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                    <span>Sin contacto cargado</span>
                                  </>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedResource(resource);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    shareResource(resource);
                                  }}
                                >
                                  <Share2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal de detalles */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          {selectedResource && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-start gap-3">
                  <span className="text-2xl">
                    {getTypeIcon(selectedResource.type)}
                  </span>
                  <span className="flex-1 leading-snug">
                    {selectedResource.name}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      variant={
                        selectedResource.verified ? "default" : "outline"
                      }
                      className="text-xs"
                    >
                      {selectedResource.verified ? "Verificado" : "Sin verificar"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {getTypeLabel(selectedResource.type)}
                    </Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>

              {selectedResource.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedResource.description}
                </p>
              )}

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div>{selectedResource.address}</div>
                    <a
                      href={buildMapsUrl(selectedResource)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-xs inline-flex items-center gap-1 mt-1 hover:underline"
                    >
                      Abrir en Google Maps
                    </a>
                  </div>
                </div>

                {selectedResource.schedule && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedResource.schedule}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedResource.contact_phone && (
                    <a
                      href={`tel:${selectedResource.contact_phone}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-muted transition"
                    >
                      <Phone className="h-4 w-4" /> Llamar
                    </a>
                  )}
                  {selectedResource.contact_email && (
                    <a
                      href={`mailto:${selectedResource.contact_email}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-muted transition"
                    >
                      <Mail className="h-4 w-4" /> Enviar email
                    </a>
                  )}
                </div>

                {selectedResource.needs &&
                  selectedResource.needs.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Necesidades actuales
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedResource.needs.map((n, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs rounded-full px-2 py-0.5"
                          >
                            {n}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDetailsOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => shareResource(selectedResource)}
                >
                  <Share2 className="h-4 w-4 mr-2" /> Compartir
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
