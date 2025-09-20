import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bus, 
  Users, 
  Briefcase, 
  Shield, 
  Bell, 
  ArrowRight,
  MapPin,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";

export function ModuleGrid() {
  const modules = [
    {
      title: "Transporte Público",
      description: "Estado en tiempo real de colectivos, paradas y reportes ciudadanos",
      icon: Bus,
      href: "/transport",
      color: "primary",
      stats: "15 líneas activas",
      recent: [
        "Línea 1: Funcionando normal",
        "Línea 44: Demora 10 min",
        "Línea 2: 2 reportes nuevos"
      ]
    },
    {
      title: "Recursos Sociales",
      description: "Comedores, merenderos y ONG verificadas con ubicación y horarios",
      icon: Users,
      href: "/resources",
      color: "secondary",
      stats: "42 recursos verificados",
      recent: [
        "Comedor Santa Rita: Necesita voluntarios",
        "Merendero Los Pinos: Abierto hoy",
        "Fundación Esperanza: Nueva ubicación"
      ]
    },
    {
      title: "Bolsa de Trabajo",
      description: "Empleos formales e informales con contacto seguro y filtros avanzados",
      icon: Briefcase,
      href: "/jobs",
      color: "success",
      stats: "78 empleos disponibles",
      recent: [
        "Vendedor - Centro (Publicado hoy)",
        "Cuidador de niños - Alto Comedero",
        "Delivery - Varios sectores"
      ]
    },
    {
      title: "Seguridad Digital",
      description: "Alertas sobre estafas, grooming y fraudes con guías de prevención",
      icon: Shield,
      href: "/security",
      color: "warning",
      stats: "3 alertas activas",
      recent: [
        "Nueva estafa telefónica detectada",
        "Alerta: Falsos delivery por WhatsApp",
        "Grooming: Casos reportados en redes"
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'border-primary/20 hover:border-primary/40 hover:shadow-glow';
      case 'secondary':
        return 'border-secondary/20 hover:border-secondary/40 hover:shadow-glow-secondary';
      case 'success':
        return 'border-success/20 hover:border-success/40';
      case 'warning':
        return 'border-warning/20 hover:border-warning/40';
      default:
        return 'border-primary/20 hover:border-primary/40';
    }
  };

  const getIconColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary/10 text-primary';
      case 'secondary':
        return 'bg-secondary/10 text-secondary';
      case 'success':
        return 'bg-success/10 text-success';
      case 'warning':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Servicios disponibles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Accedé a toda la información que necesitás para moverte y crecer en Jujuy
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card 
                key={index} 
                className={`transition-smooth ${getColorClasses(module.color)} hover:scale-[1.02]`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${getIconColorClasses(module.color)}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{module.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {module.stats}
                        </Badge>
                      </div>
                    </div>
                    <Link to={module.href}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <CardDescription className="text-base mt-2">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Actividad reciente:
                    </h4>
                    {module.recent.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to={module.href}>
                    <Button className="w-full" variant="outline">
                      Explorar {module.title.toLowerCase()}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Notification CTA */}
        <div className="mt-16 text-center">
          <Card className="max-w-md mx-auto border-primary/20 bg-gradient-primary/5">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Activá tus alertas</CardTitle>
              <CardDescription>
                Recibí notificaciones personalizadas sobre transporte, empleos y más
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/notifications">
                <Button className="w-full shadow-glow">
                  Configurar notificaciones
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}