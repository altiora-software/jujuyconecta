import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MapPin, Route as RouteIcon } from "lucide-react";
import { TransportLine, TransportStop, TransportRawStop } from "./types";
import { TransportMap } from "@/components/transport/TransportMap";
import { TransportStopsList } from "@/components/transport/TransportStopsList";
import { TransportStreetView } from "./TransportStreetView";

interface MapTabProps {
  lines: TransportLine[];
  stops: TransportStop[];
  rawStops: TransportRawStop[];

  selectedLineId?: string;
  setSelectedLineId: (id: string | undefined) => void;

  selectedStopId: string | null;
  setSelectedStopId: (id: string | null) => void;

  viewMode: "urban" | "intercity";
}
export function MapTab({
  lines,
  stops,
  rawStops,
  selectedLineId,
  setSelectedLineId,
  selectedStopId,
  setSelectedStopId,
  viewMode,
}: MapTabProps) {
  if (viewMode === "intercity") {
    return (
      <Card className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <RouteIcon className="h-5 w-5 text-primary" />
            Mapa de rutas provinciales
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            En modo provincial, por ahora mostramos rutas y horarios en “Líneas y empresas”.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] md:h-[320px] rounded-2xl border border-dashed border-border/70 bg-muted/40 flex items-center justify-center text-center px-6">
            <p className="text-sm text-muted-foreground">
              Próximamente mapa provincial
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedRawStop =
    rawStops.find((r) => (r.stop_id || r.id) === selectedStopId) || null;

  return (
    <Card className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Paradas urbanas
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Elegí una parada para ver su ubicación o imagen de referencia.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* MOBILE FIRST */}
        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3">
          {/* STREET VIEW */}
          <div
            className="
              w-full
              h-[240px]
              sm:h-[300px]
              md:h-[360px]
              lg:col-span-2
              lg:h-[420px]
            "
          >
            <TransportStreetView stop={selectedRawStop} />
          </div>

          {/* LISTA */}
          <div
            className="
              w-full
              lg:col-span-1
              h-[300px]
              sm:h-[360px]
              lg:h-[420px]
            "
          >
            <TransportStopsList
              lines={lines}
              stops={stops}
              rawStops={rawStops}
              selectedLineId={selectedLineId}
              selectedStopId={selectedStopId}
              onSelectStop={setSelectedStopId}
            />
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground flex items-center gap-2">
          <span className="inline-flex h-3 w-3 rounded-full bg-primary/70" />
          Tocá una parada para verla en Google Street View o Maps.
        </p>
      </CardContent>
    </Card>
  );
}
