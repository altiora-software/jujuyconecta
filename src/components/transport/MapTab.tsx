import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { TransportLine, TransportStop } from "./types";
import { TransportMap } from "@/components/transport/TransportMap";

interface MapTabProps {
  lines: TransportLine[];
  stops: TransportStop[];
  selectedLineId?: string;
  setSelectedLineId: (id: string | undefined) => void;
}

export function MapTab({
  lines,
  stops,
  selectedLineId,
  setSelectedLineId,
}: MapTabProps) {
  return (
    <Card className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Mapa de recorridos
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Visualizá las paradas de colectivos en Jujuy
          {selectedLineId && (
            <>
              {" "}
              · Mostrando: Línea{" "}
              {lines.find((l) => l.id === selectedLineId)?.number}
            </>
          )}
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
