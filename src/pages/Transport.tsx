import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransportMap } from "@/components/transport/TransportMap";
import { Bus, Clock, AlertTriangle, Plus } from "lucide-react";
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

interface TransportReport {
  id: string;
  line_id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved' | 'dismissed';
  created_at: string;
  transport_lines: TransportLine;
}

export default function Transport() {
  const [lines, setLines] = useState<TransportLine[]>([]);
  const [stops, setStops] = useState<TransportStop[]>([]);
  const [reports, setReports] = useState<TransportReport[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [linesRes, stopsRes, reportsRes] = await Promise.all([
        supabase.from('transport_lines').select('*').eq('active', true).order('number'),
        supabase.from('transport_stops').select('*').order('order_index'),
        supabase.from('transport_reports').select(`
          *,
          transport_lines (*)
        `).eq('status', 'active').order('created_at', { ascending: false }).limit(10)
      ]);

      if (linesRes.data) setLines(linesRes.data);
      if (stopsRes.data) setStops(stopsRes.data);
      if (reportsRes.data) setReports(reportsRes.data as TransportReport[]);
    } catch (error) {
      console.error('Error fetching transport data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive' as const;
      case 'medium': return 'outline' as const;
      case 'low': return 'secondary' as const;
      default: return 'secondary' as const;
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Media';
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Transporte Público</h1>
          <p className="text-muted-foreground">Información en tiempo real sobre el transporte público en Jujuy</p>
        </div>

        <Tabs defaultValue="lines" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lines">Líneas</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="lines" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lines.map((line) => {
                const lineStops = stops.filter(stop => stop.line_id === line.id);
                const lineReports = reports.filter(report => report.line_id === line.id);
                
                return (
                  <Card key={line.id} className="hover:shadow-md transition-shadow">
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
                      <CardDescription>{line.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {lineStops.length} paradas registradas
                        </p>
                        {lineReports.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium">Reportes recientes:</p>
                            {lineReports.slice(0, 2).map((report) => (
                              <Badge 
                                key={report.id} 
                                variant={getSeverityColor(report.severity)}
                                className="text-xs"
                              >
                                {getSeverityText(report.severity)}: {report.message.slice(0, 30)}...
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedLineId(selectedLineId === line.id ? undefined : line.id)}
                          className="w-full"
                        >
                          {selectedLineId === line.id ? 'Ocultar en mapa' : 'Ver en mapa'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Recorridos</CardTitle>
                <CardDescription>
                  Visualizá las paradas de colectivos en el mapa de Jujuy
                  {selectedLineId && (
                    <>
                      {' '}- Mostrando: Línea {lines.find(l => l.id === selectedLineId)?.number}
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

          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Reportes Activos</h3>
              <Button size="sm" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Reporte
              </Button>
            </div>
            
            <div className="space-y-4">
              {reports.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay reportes activos</p>
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
                            {new Date(report.created_at).toLocaleString('es-AR')}
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
    </Layout>
  );
}