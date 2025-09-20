import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Users, Bus, Briefcase, Shield, AlertTriangle, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

interface DashboardStats {
  transportLines: number;
  transportReports: number;
  socialResources: number;
  jobs: number;
  securityAlerts: number;
  profiles: number;
}

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    transportLines: 0,
    transportReports: 0,
    socialResources: 0,
    jobs: 0,
    securityAlerts: 0,
    profiles: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchStats();
    }
  }, [isAdmin, authLoading]);

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 bg-muted rounded w-64 animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const fetchStats = async () => {
    try {
      const [
        linesRes,
        reportsRes,
        resourcesRes,
        jobsRes,
        alertsRes,
        profilesRes
      ] = await Promise.all([
        supabase.from('transport_lines').select('id', { count: 'exact', head: true }),
        supabase.from('transport_reports').select('id', { count: 'exact', head: true }),
        supabase.from('social_resources').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('security_alerts').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        transportLines: linesRes.count || 0,
        transportReports: reportsRes.count || 0,
        socialResources: resourcesRes.count || 0,
        jobs: jobsRes.count || 0,
        securityAlerts: alertsRes.count || 0,
        profiles: profilesRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSampleData = async () => {
    try {
      // Add sample transport lines
      await supabase.from('transport_lines').insert([
        { name: 'Centro - Palpalá', number: '1', color: '#2563EB', route_description: 'Recorre el centro hasta Palpalá' },
        { name: 'Alto Comedero - Centro', number: '2', color: '#DC2626', route_description: 'Conecta Alto Comedero con el centro' },
        { name: 'Palpala - San Pedro', number: '44', color: '#16A34A', route_description: 'Línea que conecta Palpalá con San Pedro' }
      ]);

      // Add sample stops
      await supabase.from('transport_stops').insert([
        { line_id: (await supabase.from('transport_lines').select('id').eq('number', '1').single()).data?.id, name: 'Terminal de Ómnibus', latitude: -24.1858, longitude: -65.2995, order_index: 1 },
        { line_id: (await supabase.from('transport_lines').select('id').eq('number', '1').single()).data?.id, name: 'Plaza Belgrano', latitude: -24.1845, longitude: -65.2980, order_index: 2 }
      ]);

      // Add sample resources
      await supabase.from('social_resources').insert([
        {
          name: 'Comedor Los Niños',
          type: 'comedor',
          description: 'Comedor comunitario que brinda almuerzo y merienda',
          address: 'Av. Córdoba 123, San Salvador de Jujuy',
          latitude: -24.1858,
          longitude: -65.2995,
          contact_phone: '+54 388 123-4567',
          schedule: 'Lun-Vie: 12:00-14:00, 16:00-18:00',
          needs: ['Donaciones de alimentos', 'Voluntarios para cocina'],
          verified: true
        },
        {
          name: 'Fundación Esperanza',
          type: 'ong',
          description: 'ONG dedicada a la asistencia social',
          address: 'Belgrano 456, Jujuy',
          latitude: -24.1845,
          longitude: -65.2980,
          contact_email: 'info@esperanza.org',
          schedule: 'Lun-Vie: 9:00-17:00',
          needs: ['Donaciones de ropa', 'Materiales escolares'],
          verified: true
        }
      ]);

      // Add sample jobs
      await supabase.from('jobs').insert([
        {
          title: 'Vendedor/a de Local Comercial',
          description: 'Se busca vendedor/a con experiencia en atención al cliente para local céntrico',
          category: 'comercio',
          type: 'formal',
          salary_range: '$80.000 - $120.000',
          location: 'Centro, San Salvador de Jujuy',
          contact_info: 'Presentarse con CV en Belgrano 789 o llamar al 388-456-7890',
          requirements: 'Experiencia mínima 1 año, secundario completo',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          title: 'Trabajos de Limpieza por Horas',
          description: 'Trabajos de limpieza domiciliaria flexibles',
          category: 'domestico',
          type: 'informal',
          salary_range: '$2.500/hora',
          location: 'Varios barrios',
          contact_info: 'WhatsApp: 388-555-1234',
          requirements: 'Responsabilidad y puntualidad'
        }
      ]);

      // Add sample security alerts
      await supabase.from('security_alerts').insert([
        {
          title: 'Nueva Modalidad de Estafa por WhatsApp',
          description: 'Se detectaron casos de estafadores que se hacen pasar por familiares pidiendo dinero urgente. Siempre verificar llamando por teléfono.',
          category: 'estafas',
          severity: 'high',
          featured: true
        },
        {
          title: 'Cuidado con Links Sospechosos',
          description: 'No hagas clic en links de mensajes que prometen premios o beneficios. Pueden robar tu información personal.',
          category: 'phishing',
          severity: 'medium'
        }
      ]);

      toast({
        title: "Datos agregados",
        description: "Se agregaron datos de ejemplo exitosamente"
      });

      fetchStats();
    } catch (error) {
      console.error('Error adding sample data:', error);
      toast({
        title: "Error",
        description: "No se pudieron agregar los datos de ejemplo",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-64 animate-pulse" />
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded animate-pulse" />
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona el contenido de Jujuy Conecta</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transport">Transporte</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
            <TabsTrigger value="jobs">Empleos</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Líneas de Transporte</CardTitle>
                  <Bus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.transportLines}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.transportReports} reportes activos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recursos Sociales</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.socialResources}</div>
                  <p className="text-xs text-muted-foreground">
                    Comedores, merenderos y ONGs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ofertas Laborales</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.jobs}</div>
                  <p className="text-xs text-muted-foreground">
                    Empleos formales e informales
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alertas de Seguridad</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.securityAlerts}</div>
                  <p className="text-xs text-muted-foreground">
                    Alertas publicadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.profiles}</div>
                  <p className="text-xs text-muted-foreground">
                    Perfiles creados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Activo</div>
                  <p className="text-xs text-muted-foreground">
                    Todos los servicios funcionando
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>
                  Gestiona el contenido de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={addSampleData} className="w-full sm:w-auto">
                  Agregar Datos de Ejemplo
                </Button>
                <p className="text-sm text-muted-foreground">
                  Agrega contenido de ejemplo para probar la plataforma con datos reales
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transport">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Transporte</CardTitle>
                <CardDescription>
                  Administra líneas de colectivos y reportes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Panel de gestión en desarrollo</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Aquí podrás crear líneas, gestionar paradas y moderar reportes
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Recursos Sociales</CardTitle>
                <CardDescription>
                  Verifica y gestiona comedores, merenderos y ONGs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Panel de gestión en desarrollo</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Aquí podrás verificar organizaciones y gestionar sus datos
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Empleos</CardTitle>
                <CardDescription>
                  Modera y gestiona ofertas laborales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Panel de gestión en desarrollo</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Aquí podrás aprobar, destacar y gestionar ofertas de trabajo
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}