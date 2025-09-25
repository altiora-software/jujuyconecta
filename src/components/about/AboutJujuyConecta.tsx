import { Layout } from "@/components/layout/Layout";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AboutJujuyConecta() {
  return (
      <div className="container mx-auto px-4 py-12">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <Badge className="mb-3">Qué es</Badge>
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Qué es Jujuy Conecta
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Una app web gratuita con <strong>inteligencia artificial asistente</strong> que te
            ayuda a moverte, informarte y descubrir Jujuy.  
            Ideal para <strong>vecinos</strong> y <strong>turistas</strong>.
          </p>
        </div>

        {/* Destacados */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="rounded-xl border p-6 bg-card">
            <h3 className="font-semibold mb-2">🚍 Transporte</h3>
            <p className="text-sm text-muted-foreground">
              Consulta líneas de colectivos, recorridos y paradas principales en
              San Salvador y alrededores.
            </p>
          </div>
          <div className="rounded-xl border p-6 bg-card">
            <h3 className="font-semibold mb-2">🏥 Servicios</h3>
            <p className="text-sm text-muted-foreground">
              Accedé a información de centros de salud, comedores y espacios de
              ayuda comunitaria.
            </p>
          </div>
          <div className="rounded-xl border p-6 bg-card">
            <h3 className="font-semibold mb-2">🌄 Turismo</h3>
            <p className="text-sm text-muted-foreground">
              Descubrí lugares emblemáticos, restaurantes y hoteles destacados
              en toda la provincia.
            </p>
          </div>
        </div>

        {/* Aviso / disclaimer */}
        <div className="mt-10 p-4 rounded-lg border bg-muted/50 text-sm text-muted-foreground flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <p>
            La información mostrada proviene de <strong>fuentes públicas</strong> (Google, mapas,
            webs abiertas, etc.). Puede contener fallas, cambios de horarios o
            datos desactualizados.  
            Recomendamos verificar siempre con las fuentes oficiales.
          </p>
        </div>
      </div>
  );
}

