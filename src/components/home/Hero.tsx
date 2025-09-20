import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Users, Briefcase, Shield } from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-gradient-hero text-white py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Movilidad, ayuda social y oportunidades 
            <span className="block text-secondary-glow">en un solo lugar</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
            La plataforma que conecta a los jujeños con información de transporte en tiempo real, 
            recursos comunitarios y oportunidades laborales.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" variant="secondary" className="shadow-glow-secondary">
              Explorar recursos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Ver empleos disponibles
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold">15+</div>
              <div className="text-sm opacity-80">Líneas de colectivo</div>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm opacity-80">Recursos sociales</div>
            </div>
            <div className="text-center">
              <Briefcase className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold">100+</div>
              <div className="text-sm opacity-80">Empleos activos</div>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm opacity-80">Alertas de seguridad</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}