import { AlertTriangle, Rocket, Newspaper, Mic2, Mountain, Bus, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AboutJujuyConecta() {
  const pillars = [
    {
      title: "Innovación",
      desc: "Impulsamos proyectos tecnológicos, startups locales y herramientas que conectan a la comunidad.",
      icon: Rocket,
    },
    {
      title: "Diario Digital",
      desc: "Noticias, historias y contenido que destacan la cultura, emprendimientos y talentos jujeños.",
      icon: Newspaper,
    },
    {
      title: "Podcast",
      desc: "Conversaciones con referentes locales y mentes creativas que inspiran y conectan ideas.",
      icon: Mic2,
    },
    {
      title: "Turismo & Cultura",
      desc: "Descubrí los lugares emblemáticos, gastronomía y eventos culturales de nuestra provincia.",
      icon: Mountain,
    },
    {
      title: "Transporte y Servicios",
      desc: "Información actualizada de colectivos, paradas, centros de salud y ayuda comunitaria.",
      icon: Bus,
    },
    {
      title: "Comunidad",
      desc: "Conectamos vecinos y emprendedores, generando un ecosistema participativo y de oportunidades.",
      icon: Heart,
    },
  ];

  return (
    <div className="mt-24 sm:mt-32">
      {/* Encabezado con Estilo */}
      <div className="mb-12 text-center">
        <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary px-4 py-1 uppercase tracking-widest text-[10px]">
          Nuestra Esencia
        </Badge>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
          ¿Qué es <span className="text-primary italic">Jujuy Conecta</span>?
        </h2>
        <p className="text-muted-foreground max-w-4xl mx-auto text-base sm:text-lg leading-relaxed">
          Es la plataforma digital que une a toda la provincia, fusionando{" "}
          <span className="text-foreground font-semibold">tecnología, cultura y comunidad</span>. 
          Nuestro ecosistema incluye un diario digital, un podcast de emprendimiento y herramientas útiles para el día a día.
        </p>
      </div>

      {/* Grid de Pilares con Iconos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pillars.map((p, i) => (
          <div 
            key={i} 
            className="group p-6 rounded-2xl border border-border/50 bg-card/40 hover:bg-card hover:border-primary/30 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <p.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
              {p.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {p.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Disclaimer / Aviso de Transparencia */}
      <div className="mt-12 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
        <div className="p-2 bg-amber-500/10 rounded-full shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wider">
            Aviso de Transparencia
          </h4>
          <p className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-500/80 leading-relaxed">
            La información mostrada proviene de <strong>fuentes públicas</strong> (datos abiertos, mapas y servicios municipales). 
            Aunque trabajamos para mantener todo actualizado, recomendamos <strong>verificar con fuentes oficiales</strong> antes de tomar decisiones críticas.
          </p>
        </div>
      </div>
    </div>
  );
}