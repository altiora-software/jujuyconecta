import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Clock, Phone, Mail, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialResource {
  id: string;
  name: string;
  type: 'comedor' | 'merendero' | 'ong' | 'centro_salud' | 'educativo';
  description: string | null;
  address: string;
  contact_phone: string | null;
  contact_email: string | null;
  schedule: string | null;
  needs: string[] | null;
  verified: boolean;
  active: boolean;
  created_at: string;
}

export default function Resources() {
  const [resources, setResources] = useState<SocialResource[]>([]);
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
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
    };
    return labels[type as keyof typeof labels] || type;
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

  const filteredResources = selectedType === 'todos' 
    ? resources 
    : resources.filter(r => r.type === selectedType);

  const resourceTypes = [
    { value: 'todos', label: 'Todos' },
    { value: 'comedor', label: 'Comedores' },
    { value: 'merendero', label: 'Merenderos' },
    { value: 'ong', label: 'ONGs' },
    { value: 'centro_salud', label: 'Centros de Salud' },
    { value: 'educativo', label: 'Educativos' }
  ];

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
                              {resource.verified ? "✓ Verificado" : "Sin verificar"}
                            </Badge>
                            <span>{getTypeLabel(resource.type)}</span>
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {resource.description && (
                      <p className="text-sm text-muted-foreground">
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

                      {resource.contact_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={`tel:${resource.contact_phone}`}
                            className="text-primary hover:underline"
                          >
                            {resource.contact_phone}
                          </a>
                        </div>
                      )}

                      {resource.contact_email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={`mailto:${resource.contact_email}`}
                            className="text-primary hover:underline"
                          >
                            {resource.contact_email}
                          </a>
                        </div>
                      )}
                    </div>

                    {resource.needs && resource.needs.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Necesidades actuales:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {resource.needs.slice(0, 3).map((need, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {need}
                            </Badge>
                          ))}
                          {resource.needs.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{resource.needs.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button size="sm" variant="outline" className="w-full" disabled>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}