import { Layout } from "@/components/layout/Layout";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, AlertTriangle, Clock, Eye, Share2, Link as LinkIcon, AlertOctagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  // opcionales si ya corriste la migración
  image_url?: string | null;
  prevention?: string | null;
}

export default function Security() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [loading, setLoading] = useState(true);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);

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
        .select("id,title,description,category,severity,active,featured,created_at,image_url,prevention")
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

  const getSeverityColor = (severity: string) => {
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
          url: typeof window !== "undefined" ? window.location.href : undefined,
        });
      } else {
        await navigator.clipboard.writeText(info);
        toast({ title: "Copiado", description: "Detalles copiados al portapapeles." });
      }
    } catch {
      // usuario canceló
    }
  };

  const renderPrevention = (prevention?: string | null) => {
    if (!prevention) return null;
    // admite viñetas separadas por saltos de línea o puntos
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
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-64 animate-pulse" />
            <div className="h-4 bg-muted rounded w-96 animate-pulse" />
            <div className="grid gap-4">
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Seguridad Digital</h1>
          <p className="text-muted-foreground">
            Alertas sobre estafas, grooming y fraudes digitales
          </p>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
            {categories.map((category) => (
              <TabsTrigger key={category.value} value={category.value} className="text-sm">
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Featured Alerts */}
          {alerts.filter((a) => a.featured).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Alertas Destacadas
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {alerts
                  .filter(
                    (a) => a.featured && (selectedCategory === "todas" || a.category === selectedCategory)
                  )
                  .map((a) => (
                    <Card key={a.id} className="border-destructive bg-destructive/5">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCategoryIcon(a.category)}</span>
                            <Badge variant={getSeverityColor(a.severity)} className="text-xs">
                              {getSeverityText(a.severity)}
                            </Badge>
                            <Badge variant="default">Destacada</Badge>
                          </div>
                        </div>
                        <CardTitle className="text-lg">{a.title}</CardTitle>
                        <CardDescription>{getCategoryLabel(a.category)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">{a.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDate(a.created_at)}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openDetails(a)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Leer más
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => shareAlert(a)}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Compartir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* All Alerts */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Todas las Alertas
              {selectedCategory !== "todas" && ` - ${getCategoryLabel(selectedCategory)}`}
            </h2>

            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {selectedCategory === "todas"
                        ? "No hay alertas de seguridad"
                        : `No hay alertas de ${getCategoryLabel(selectedCategory).toLowerCase()}`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredAlerts.map((a) => (
                  <Card key={a.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCategoryIcon(a.category)}</span>
                            <Badge variant={getSeverityColor(a.severity)} className="text-xs">
                              {getSeverityText(a.severity)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(a.category)}
                            </Badge>
                            {a.featured && <Badge className="text-xs">Destacada</Badge>}
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold">{a.title}</h3>
                        <p className="text-muted-foreground">{a.description}</p>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Publicado: {formatDate(a.created_at)}
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openDetails(a)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => shareAlert(a)}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Compartir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Tabs>
      </div>

      {/* Modal de detalles */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedAlert.title}</DialogTitle>
                <DialogDescription className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={getSeverityColor(selectedAlert.severity)} className="text-xs">
                    {getSeverityText(selectedAlert.severity)}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryLabel(selectedAlert.category)}
                  </Badge>
                  {selectedAlert.featured && <Badge className="text-xs">Destacada</Badge>}
                </DialogDescription>
              </DialogHeader>

              {/* Imagen opcional */}
              {selectedAlert.image_url && (
                <div className="rounded-md overflow-hidden border mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedAlert.image_url}
                    alt={selectedAlert.title}
                    className="w-full h-56 object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              <p className="text-sm text-foreground whitespace-pre-line">{selectedAlert.description}</p>

              {renderPrevention(selectedAlert.prevention)}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Cerrar
                </Button>
                <Button variant="secondary" onClick={() => shareAlert(selectedAlert)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
                {selectedAlert.image_url && (
                  <a
                    href={selectedAlert.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm hover:bg-muted transition"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Ver imagen
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
