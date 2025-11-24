// src/components/tourism/TourismPlaceDetailsModal.tsx
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Mountain, Bus, Navigation2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type TourismPlace = Database["public"]["Tables"]["tourism_places"]["Row"];

export interface UserLocation {
  lat: number;
  lng: number;
}

interface TransportLineInfo {
  id: string;
  number: string;
  name: string;
  color: string | null;
}

interface NearbyStop {
  id: string;
  name: string;
  direccion: string | null;
  distance_m: number;
  line: TransportLineInfo;
}

interface NearbyLineGroup {
  line: TransportLineInfo;
  stops: NearbyStop[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place: TourismPlace | null;
  onShowRoute: (placeId: string, userLocation: UserLocation) => void;
}

export function TourismPlaceDetailsModal({
  open,
  onOpenChange,
  place,
  onShowRoute,
}: Props) {
  const { toast } = useToast();

  const [nearbyLines, setNearbyLines] = useState<NearbyLineGroup[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  // buscar colectivos que llegan cerca del lugar
  useEffect(() => {
    const load = async () => {
      if (
        !place ||
        place.latitude == null ||
        place.longitude == null ||
        !isFinite(place.latitude) ||
        !isFinite(place.longitude)
      ) {
        setNearbyLines([]);
        return;
      }

      setLoadingNearby(true);
      try {
        const { data, error } = await supabase
          .from("transport_raw_stops")
          .select(
            `
              id,
              line_id,
              stop_name,
              direccion,
              latitude,
              longitude,
              transport_lines (
                id,
                number,
                name,
                color
              )
            `,
          );

        if (error) throw error;

        const stops = (data || []).filter(
          (s: any) => s.latitude != null && s.longitude != null,
        ) as any[];

        const placeLat = Number(place.latitude);
        const placeLng = Number(place.longitude);

        const maxDistanceM = 600; // radio de 600m aprox

        const nearby: NearbyStop[] = stops
          .map((s) => {
            const stopLat = Number(s.latitude);
            const stopLng = Number(s.longitude);
            const distance_m = haversineMeters(
              placeLat,
              placeLng,
              stopLat,
              stopLng,
            );

            const line = s.transport_lines as {
              id: string;
              number: string | number;
              name: string;
              color: string | null;
            } | null;

            if (!line) return null;

            return {
              id: s.id as string,
              name: (s.stop_name as string) || "Parada",
              direccion: (s.direccion as string | null) || null,
              distance_m,
              line: {
                id: line.id,
                number: String(line.number),
                name: line.name,
                color: line.color,
              },
            } as NearbyStop;
          })
          .filter((s): s is NearbyStop => !!s && s.distance_m <= maxDistanceM)
          .sort((a, b) => a.distance_m - b.distance_m);

        const groupsMap = new Map<string, NearbyLineGroup>();

        nearby.forEach((stop) => {
          const key = stop.line.id;
          if (!groupsMap.has(key)) {
            groupsMap.set(key, {
              line: stop.line,
              stops: [],
            });
          }
          groupsMap.get(key)!.stops.push(stop);
        });

        const groups = Array.from(groupsMap.values()).map((g) => ({
          ...g,
          stops: g.stops.slice(0, 4), // máximo 4 paradas por línea
        }));

        groups.sort((a, b) =>
          a.line.number.localeCompare(b.line.number, "es"),
        );

        setNearbyLines(groups);
      } catch (err: any) {
        console.error("Error fetching nearby transport:", err);
        toast({
          title: "Error",
          description:
            err?.message || "No se pudo cargar el transporte cercano.",
          variant: "destructive",
        });
        setNearbyLines([]);
      } finally {
        setLoadingNearby(false);
      }
    };

    if (open) {
      load();
    } else {
      setNearbyLines([]);
    }
  }, [open, place, toast]);

  if (!place) return null;

  const mapsDestination = place.latitude && place.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
    : null;

  const handleUseMyLocation = () => {
    if (!place.id || place.latitude == null || place.longitude == null) {
      toast({
        title: "Sin coordenadas",
        description:
          "Este lugar todavía no tiene ubicación precisa cargada.",
        variant: "destructive",
      });
      return;
    }

    if (!navigator.geolocation) {
      toast({
        title: "Sin geolocalización",
        description:
          "Tu navegador no permite obtener la ubicación. Probá abrir en Google Maps.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        onShowRoute(place.id, userLoc);
        onOpenChange(false);
      },
      (err) => {
        console.error(err);
        toast({
          title: "No se pudo obtener tu ubicación",
          description:
            "Revisá los permisos de ubicación del navegador o usá el botón de Google Maps.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mountain className="h-4 w-4 text-primary" />
            {place.name}
          </DialogTitle>
          <DialogDescription>
            Información ampliada del punto turístico y cómo llegar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Imagen grande */}
          {place.image_url && (
            <div className="w-full max-h-[360px] overflow-hidden rounded-xl border bg-black/5">
              <img
                src={place.image_url}
                alt={place.name || "Imagen del lugar"}
                className="w-full h-full max-h-[360px] object-contain md:object-contain bg-black/80"
              />
            </div>
          )}

          {/* Chips de info */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {(place as any).region && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {(place as any).region}
              </span>
            )}
            {(place as any).category && (
              <Badge variant="outline">
                {(place as any).category}
              </Badge>
            )}
            {place.altitude_meters && (
              <Badge variant="secondary">
                {place.altitude_meters} msnm
              </Badge>
            )}
            {place.best_time_to_visit && (
              <Badge variant="secondary">
                Mejor época: {place.best_time_to_visit}
              </Badge>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Descripción</h4>
            {place.description ? (
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {place.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Próximamente vamos a sumar una descripción más completa para
                este lugar.
              </p>
            )}
          </div>

          <Separator />

          {/* Cómo llegar */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Navigation2 className="h-4 w-4" />
              Cómo llegar
            </h4>

            {place.latitude != null && place.longitude != null ? (
              <div className="grid gap-2 md:grid-cols-2">
                <Button
                  size="sm"
                  className="w-full"
                  variant="outline"
                  onClick={handleUseMyLocation}
                >
                  Usar mi ubicación y ver ruta en el mapa
                </Button>

                {mapsDestination && (
                  <Button size="sm" className="w-full" asChild>
                    <a
                      href={mapsDestination}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir en Google Maps
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Este lugar todavía no tiene coordenadas cargadas, pronto vas a
                poder ver cómo llegar.
              </p>
            )}
          </div>

          <Separator />

          {/* Transporte público cercano */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Bus className="h-4 w-4" />
              Transporte público que llega cerca
            </h4>

            {loadingNearby && (
              <p className="text-xs text-muted-foreground">
                Buscando líneas y paradas cercanas…
              </p>
            )}

            {!loadingNearby && nearbyLines.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Todavía no detectamos paradas de colectivo cercanas o no están
                cargadas en el sistema.
              </p>
            )}

            {!loadingNearby && nearbyLines.length > 0 && (
              <div className="space-y-3">
                {nearbyLines.map((group) => (
                  <div
                    key={group.line.id}
                    className="rounded border p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{
                            backgroundColor:
                              group.line.color || "#2563eb",
                          }}
                        >
                          {group.line.number}
                        </span>
                        <div className="text-xs">
                          <div className="font-medium">
                            Línea {group.line.number}
                          </div>
                          <div className="text-muted-foreground">
                            {group.line.name}
                          </div>
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {group.stops.map((s) => (
                        <li key={s.id} className="flex justify-between gap-2">
                          <span className="flex-1">
                            {s.direccion || s.name}
                          </span>
                          <span className="shrink-0">
                            {Math.round(s.distance_m)} m
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <p className="text-[11px] text-muted-foreground">
                  Las distancias son aproximadas desde este punto, siempre
                  confirmá la parada exacta en la sección de transporte.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Haversine simple en metros
function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // radio tierra
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
