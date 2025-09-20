import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  category: 'phishing' | 'estafas' | 'grooming' | 'fraudes' | 'malware' | 'otros';
  severity: 'low' | 'medium' | 'high' | 'critical';
  active: boolean;
  featured: boolean;
  created_at: string;
}

export default function Security() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    { value: 'todas', label: 'Todas las categorías' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'estafas', label: 'Estafas' },
    { value: 'grooming', label: 'Grooming' },
    { value: 'fraudes', label: 'Fraudes' },
    { value: 'malware', label: 'Malware' },
    { value: 'otros', label: 'Otros' }
  ];

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setAlerts(data as SecurityAlert[]);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las alertas de seguridad",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive' as const;
      case 'high': return 'destructive' as const;
      case 'medium': return 'outline' as const;
      case 'low': return 'secondary' as const;
      default: return 'secondary' as const;
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Media';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'phishing': return '🎣';
      case 'estafas': return '💰';
      case 'grooming': return '👥';
      case 'fraudes': return '🚫';
      case 'malware': return '🦠';
      default: return '⚠️';
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const filteredAlerts = selectedCategory === 'todas' 
    ? alerts 
    : alerts.filter(alert => alert.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <p className="text-muted-foreground">Alertas sobre estafas, grooming y fraudes digitales</p>
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
          {alerts.filter(alert => alert.featured).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Alertas Destacadas
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {alerts
                  .filter(alert => alert.featured && (selectedCategory === 'todas' || alert.category === selectedCategory))
                  .map((alert) => (
                    <Card key={alert.id} className="border-destructive bg-destructive/5">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCategoryIcon(alert.category)}</span>
                            <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                              {getSeverityText(alert.severity)}
                            </Badge>
                            <Badge variant="default">Destacada</Badge>
                          </div>
                        </div>
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <CardDescription>{getCategoryLabel(alert.category)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">{alert.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDate(alert.created_at)}
                          </div>
                          <Button size="sm" variant="outline" disabled>
                            <Eye className="h-4 w-4 mr-2" />
                            Leer más
                          </Button>
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
              {selectedCategory !== 'todas' && ` - ${getCategoryLabel(selectedCategory)}`}
            </h2>
            
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {selectedCategory === 'todas' 
                        ? 'No hay alertas de seguridad'
                        : `No hay alertas de ${getCategoryLabel(selectedCategory).toLowerCase()}`
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredAlerts.map((alert) => (
                  <Card key={alert.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCategoryIcon(alert.category)}</span>
                            <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                              {getSeverityText(alert.severity)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(alert.category)}
                            </Badge>
                            {alert.featured && (
                              <Badge className="text-xs">Destacada</Badge>
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold">{alert.title}</h3>
                        <p className="text-muted-foreground">{alert.description}</p>
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Publicado: {formatDate(alert.created_at)}
                          </div>
                          
                          <Button size="sm" variant="outline" disabled>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </Button>
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
    </Layout>
  );
}