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
        <p className="text-muted-foreground max-w-3xl mx-auto">
          <strong>Jujuy Conecta</strong> es la plataforma digital que une a toda la provincia, conectando 
          <strong> tecnología, cultura y comunidad</strong>. 
          Nuestro objetivo es <strong>informar, inspirar y fomentar el desarrollo</strong> local.
          <br /><br />
          Contamos con un <strong>diario digital</strong>, un <strong>podcast</strong> que explora ideas y emprendimientos, y espacios para que vecinos y turistas descubran todo lo que Jujuy ofrece.
        </p>
      </div>

      {/* Pilares / Destacados */}
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        <div className="rounded-xl border p-6 bg-card">
          <h3 className="font-semibold mb-2">🚀 Innovación</h3>
          <p className="text-sm text-muted-foreground">
            Impulsamos proyectos tecnológicos, startups locales y herramientas digitales que conectan a la comunidad.
          </p>
        </div>
        <div className="rounded-xl border p-6 bg-card">
          <h3 className="font-semibold mb-2">🗞 Diario Digital</h3>
          <p className="text-sm text-muted-foreground">
            Noticias, historias y contenido que destacan la cultura, emprendimientos y talentos jujeños.
          </p>
        </div>
        <div className="rounded-xl border p-6 bg-card">
          <h3 className="font-semibold mb-2">🎙 Podcast</h3>
          <p className="text-sm text-muted-foreground">
            Conversaciones con referentes locales, expertos en tecnología y mentes creativas que inspiran y conectan ideas.
          </p>
        </div>
        <div className="rounded-xl border p-6 bg-card">
          <h3 className="font-semibold mb-2">🌄 Turismo & Cultura</h3>
          <p className="text-sm text-muted-foreground">
            Descubrí los lugares emblemáticos, restaurantes, hoteles y eventos culturales de Jujuy.
          </p>
        </div>
        <div className="rounded-xl border p-6 bg-card">
          <h3 className="font-semibold mb-2">🚍 Transporte y Servicios</h3>
          <p className="text-sm text-muted-foreground">
            Información de líneas de colectivos, recorridos, paradas, centros de salud y espacios de ayuda comunitaria.
          </p>
        </div>
        <div className="rounded-xl border p-6 bg-card">
          <h3 className="font-semibold mb-2">💡 Comunidad</h3>
          <p className="text-sm text-muted-foreground">
            Conectamos vecinos, emprendedores y visitantes, generando oportunidades y un ecosistema participativo.
          </p>
        </div>
      </div>

      {/* Aviso / disclaimer */}
      <div className="mt-10 p-4 rounded-lg border bg-muted/50 text-sm text-muted-foreground flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
        <p>
          La información mostrada proviene de <strong>fuentes públicas</strong> (Google, mapas, webs abiertas, etc.) y puede contener cambios o errores.  
          Recomendamos siempre <strong>verificar con fuentes oficiales</strong> antes de tomar decisiones.
        </p>
      </div>
    </div>
  );
}
