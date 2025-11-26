import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MapPin, Route as RouteIcon } from "lucide-react";
import { TransportLine, TransportStop } from "./types";
import { TransportMap } from "@/components/transport/TransportMap";

interface MapTabProps {
  lines: TransportLine[];
  stops: TransportStop[];
  selectedLineId?: string;
  setSelectedLineId: (id: string | undefined) => void;

  // nuevo: modo actual
  viewMode: "urban" | "intercity";
}

export function MapTab({
  lines,
  stops,
  selectedLineId,
  setSelectedLineId,
  viewMode,
}: MapTabProps) {
  // -----------------------------
  // MODO PROVINCIAL: EN DESARROLLO
  // -----------------------------
  if (viewMode === "intercity") {
    return (
      <Card className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <RouteIcon className="h-5 w-5 text-primary" />
            Mapa de rutas provinciales
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Estamos trabajando para mostrar en el mapa los recorridos y paradas
            de los servicios provinciales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-[4/3] md:aspect-[16/9] rounded-2xl border border-dashed border-border/70 bg-muted/40 flex items-center justify-center text-center px-6">
            <div className="space-y-2">
              <p className="text-sm md:text-base font-medium">
                Mapa de servicios provinciales en proceso
              </p>
              <p className="text-[11px] md:text-xs text-muted-foreground max-w-md mx-auto">
                Por ahora podés consultar todas las empresas, rutas y horarios
                en la pestaña <strong>“Líneas y empresas”</strong>.  
                Próximamente vas a poder ver también estos recorridos
                sobre el mapa, con sus paradas y puntos de referencia.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // -----------------------------
  // MODO URBANO: MAPA ACTUAL
  // -----------------------------
  return (
    <Card className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Mapa de recorridos urbanos
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Visualizá las paradas y recorridos de las líneas urbanas de San
          Salvador de Jujuy.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden border">
          <TransportMap
            lines={lines}
            stops={stops}
            selectedLineId={selectedLineId}
            onLineSelect={setSelectedLineId}
          />
        </div>

        <p className="text-[11px] text-muted-foreground flex items-center gap-2">
          <span className="inline-flex h-3 w-3 rounded-full bg-primary/70" />
          Seleccioná una línea en la lista o sobre el mapa para ver su
          recorrido.
        </p>
      </CardContent>
    </Card>
  );
}
