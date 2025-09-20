import { Layout } from "@/components/layout/Layout";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Users, Clock, Phone, Mail, ExternalLink, Share2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialResource {
  id: string;
  name: string;
  type: 'comedor' | 'merendero' | 'ong' | 'centro_salud' | 'educativo' | string;
  description: string | null;
  address: string;
  contact_phone: string | null;
  contact_email: string | null;
  schedule: string | null;
  needs: string[] | null;
  verified: boolean;
  active: boolean;
  created_at: string;
  // opcionales si existen en la tabla (recomendado)
  latitude?: number | null;
  longitude?: number | null;
}

export default function Resources() {
  const [resources, setResources] = useState<SocialResource[]>([]);
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<SocialResource | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('social_resources')
        .select('*')
        .eq('active', true)
        .order('verified', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setResources(data as SocialResource[]);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los recursos sociales",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'comedor': 'Comedor',
      'merendero': 'Merendero', 
      'ong': 'ONG',
      'centro_salud': 'Centro de Salud',
      'educativo': 'Educativo'
    } as const;
    return (labels as any)[type] || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'comedor':
      case 'merendero':
        return '🍽️';
      case 'ong':
        return '❤️';
      case 'centro_salud':
        return '🏥';
      case 'educativo':
        return '📚';
      default:
        return '📍';
    }
  };

  const filteredResources = useMemo(
    () => (selectedType === 'todos' ? resources : resources.filter(r => r.type === selectedType)),
    [resources, selectedType]
  );

  const resourceTypes = [
    { value: 'todos', label: 'Todos' },
    { value: 'comedor', label: 'Comedores' },
    { value: 'merendero', label: 'Merenderos' },
    { value: 'ong', label: 'ONGs' },
    { value: 'centro_salud', label: 'Centros de Salud' },
    { value: 'educativo', label: 'Educativos' }
  ];

  const buildMapsUrl = (r: SocialResource) => {
    if (r.latitude != null && r.longitude != null) {
      return `https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`;
    }
    const q = encodeURIComponent(r.address || r.name);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  };

  const shareResource = async (r: SocialResource) => {
    const text = `Recurso: ${r.name} (${getTypeLabel(r.type)})\nDirección: ${r.address}\n${r.schedule ? `Horarios: ${r.schedule}\n` : ''}Mapa: ${buildMapsUrl(r)}`;
    const shareData = {
      title: r.name,
      text,
      url: typeof window !== "undefined" ? window.location.href : undefined
    };
    // Si existe Web Share API, usarla; si no, copiar al portapapeles
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(text);
        toast({ title: "Copiado", description: "Información copiada al portapapeles." });
      }
    } catch {
      // usuario canceló compartir
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-64 animate-pulse" />
            <div className="h-4 bg-muted rounded w-96 animate-pulse" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded animate-pulse" />
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Recursos Sociales</h1>
          <p className="text-muted-foreground">Comedores, merenderos y ONGs verificadas en Jujuy</p>
        </div>

        <Tabs value={selectedType} onValueChange={setSelectedType} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {resourceTypes.map((type) => (
              <TabsTrigger key={type.value} value={type.value} className="text-sm">
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedType}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredResources.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {selectedType === 'todos' 
                          ? 'No hay recursos registrados'
                          : `No hay ${getTypeLabel(selectedType).toLowerCase()}s registrados`
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTypeIcon(resource.type)}</span>
                          <div>
                            <CardTitle className="text-lg">{resource.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Badge variant={resource.verified ? "default" : "outline"}>
                                {resource.verified ? <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Verificado</span> : "Sin verificar"}
                              </Badge>
                              <span>{getTypeLabel(resource.type)}</span>
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {resource.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {resource.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span>{resource.address}</span>
                        </div>

                        {resource.schedule && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{resource.schedule}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => { setSelectedResource(resource); setDetailsOpen(true); }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver detalles
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full"
                          onClick={() => shareResource(resource)}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de detalles */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedResource && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-start gap-2">
                  <span className="text-xl">{getTypeIcon(selectedResource.type)}</span>
                  <span className="flex-1">{selectedResource.name}</span>
                </DialogTitle>
                <DialogDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant={selectedResource.verified ? "default" : "outline"}>
                      {selectedResource.verified ? "Verificado" : "Sin verificar"}
                    </Badge>
                    <Badge variant="secondary">{getTypeLabel(selectedResource.type)}</Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>

              {selectedResource.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedResource.description}
                </p>
              )}

              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-2 text-sm">
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
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedResource.schedule}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedResource.contact_phone && (
                    <a
                      href={`tel:${selectedResource.contact_phone}`}
                      className="inline-flex items-center justify-center gap-2 rounded border px-3 py-2 text-sm hover:bg-muted transition"
                    >
                      <Phone className="h-4 w-4" /> Llamar
                    </a>
                  )}
                  {selectedResource.contact_email && (
                    <a
                      href={`mailto:${selectedResource.contact_email}`}
                      className="inline-flex items-center justify-center gap-2 rounded border px-3 py-2 text-sm hover:bg-muted transition"
                    >
                      <Mail className="h-4 w-4" /> Enviar email
                    </a>
                  )}
                </div>

                {selectedResource.needs && selectedResource.needs.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Necesidades actuales
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedResource.needs.map((n, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {n}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>Cerrar</Button>
                <Button variant="secondary" onClick={() => shareResource(selectedResource)}>
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
