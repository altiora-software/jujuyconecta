"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, AlertTriangle } from "lucide-react";
import { TransportRawStop } from "./types";
import { Button } from "@/components/ui/button";

function buildQuery(stop: TransportRawStop) {
  const base = stop.direccion || stop.address_raw || stop.stop_name || "";
  const city = stop.city || "San Salvador de Jujuy";
  const prov = stop.province || "Jujuy";
  const country = stop.country || "Argentina";

  return base
    ? `${base}, ${city}, ${prov}, ${country}`
    : `${city}, ${prov}, ${country}`;
}

export function TransportStreetView({
  stop,
}: {
  stop: TransportRawStop | null;
}) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const query = useMemo(() => (stop ? buildQuery(stop) : ""), [stop]);

  const [mode, setMode] = useState<"streetview" | "map">("streetview");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setMode("map");
  }, [stop?.id]);

  if (!stop) {
    return (
      <Card className="rounded-2xl border bg-background/70 h-full">
        <CardContent className="h-full flex items-center justify-center text-center text-sm text-muted-foreground px-4">
          Seleccioná una parada para ver la vista
        </CardContent>
      </Card>
    );
  }

  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;

  if (!key) {
    return (
      <Card className="rounded-2xl border bg-background/70 h-full">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Vista de imágenes no disponible en este momento.
            </p>
          </div>

          <Button asChild variant="outline" className="w-full">
            <a href={gmapsUrl} target="_blank" rel="noreferrer">
              Abrir en Google Maps
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const streetViewSrc =
    `https://www.google.com/maps/embed/v1/streetview?key=${encodeURIComponent(
      key
    )}` +
    `&location=${encodeURIComponent(query)}` +
    `&fov=80&heading=0&pitch=0`;

  const mapSrc =
    `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(
      key
    )}` +
    `&q=${encodeURIComponent(query)}`;

  return (
    <Card className="rounded-2xl border bg-background/70 h-full flex flex-col">
      {/* HEADER MOBILE FIRST */}
      <div className="p-3 border-b bg-background/90 backdrop-blur flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs font-medium truncate">
            {stop.stop_name ||
              stop.direccion ||
              stop.address_raw ||
              "Parada"}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          
          <Button
            size="sm"
            variant={mode === "map" ? "default" : "outline"}
            className="h-8 text-[11px] shrink-0"
            onClick={() => setMode("map")}
          >
            Mapa
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 text-[11px] shrink-0"
          >
            <a href={gmapsUrl} target="_blank" rel="noreferrer">
              Maps
            </a>
          </Button>
          <Button
            size="sm"
            variant={mode === "streetview" ? "default" : "outline"}
            className="h-8 text-[11px] shrink-0"
            onClick={() => setMode("streetview")}
          >
            Street View
          </Button>
        </div>
      </div>

      {/* VISOR */}
      <div
        className="
          relative
          w-full
          h-[220px]
          sm:h-[280px]
          md:h-[340px]
          lg:h-full
        "
      >
        {failed ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
            <p className="text-sm text-muted-foreground">
              Estamos trabajando con Google para incorporar imágenes de esta
              parada.
            </p>
            <Button asChild variant="outline">
              <a href={gmapsUrl} target="_blank" rel="noreferrer">
                Ver en Google Maps
              </a>
            </Button>
          </div>
        ) : mode === "streetview" ? (
          // <iframe
          //   key={`sv-${stop.id}`}
          //   title="Street View"
          //   src={streetViewSrc}
          //   className="w-full h-full"
          //   loading="lazy"
          //   referrerPolicy="no-referrer-when-downgrade"
          //   onError={() => setFailed(true)}
          // />
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
            <p className="text-sm text-muted-foreground">
              Estamos trabajando con Google para incorporar imágenes de esta
              parada.
            </p>
            <Button asChild variant="outline">
              <a href={gmapsUrl} target="_blank" rel="noreferrer">
                Ver en Google Maps
              </a>
            </Button>
          </div>
        ) : (
          <iframe
            key={`map-${stop.id}`}
            title="Mapa"
            src={mapSrc}
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>
    </Card>
  );
}
