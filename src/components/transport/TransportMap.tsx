import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransportLine {
  id: string;
  name: string;
  number: string;
  color: string;
}

interface TransportStop {
  id: string;
  line_id: string;
  name: string;
  latitude: number;
  longitude: number;
  order_index: number;
}

interface TransportMapProps {
  lines: TransportLine[];
  stops: TransportStop[];

  selectedLineId?: string;
  selectedStopId: string | null;
  onStopSelect: (stopId: string | null) => void;
  onLineSelect: (lineId: string) => void;
}

const JUJUY_CENTER: [number, number] = [-65.2971, -24.1858];

function isValidStop(s: TransportStop) {
  return (
    typeof s.latitude === "number" &&
    Number.isFinite(s.latitude) &&
    typeof s.longitude === "number" &&
    Number.isFinite(s.longitude)
  );
}

function normalize(s: string) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function looksLikeHub(name: string) {
  const n = normalize(name || "");
  const keywords = [
    "terminal","plaza","hospital","sanatorio","universidad","unju",
    "escuela","colegio","mercado","catedral","parque","puente","gobierno","municipal",
  ];
  return keywords.some((k) => n.includes(k));
}

export function TransportMap({
  lines,
  stops,
  selectedLineId,
  selectedStopId,
  onStopSelect,
  onLineSelect,
}: TransportMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMainStops, setShowMainStops] = useState(true);

  const selectedLine = useMemo(
    () => lines.find((l) => l.id === selectedLineId),
    [lines, selectedLineId],
  );

  const filteredStops = useMemo(() => {
    if (!selectedLineId) return [];
    return stops
      .filter((s) => s.line_id === selectedLineId)
      .filter(isValidStop)
      .sort((a, b) => a.order_index - b.order_index);
  }, [stops, selectedLineId]);

  const mainStops = useMemo(() => {
    if (filteredStops.length <= 12) return filteredStops;

    const first = filteredStops[0];
    const last = filteredStops[filteredStops.length - 1];
    const step = Math.max(4, Math.floor(filteredStops.length / 12));
    const sampled = filteredStops.filter((_, i) => i % step === 0);
    const hubs = filteredStops.filter((s) => looksLikeHub(s.name));

    const merged = [first, ...sampled, ...hubs, last];
    const seen = new Set<string>();
    const out: TransportStop[] = [];
    for (const s of merged) {
      if (seen.has(s.id)) continue;
      seen.add(s.id);
      out.push(s);
    }
    return out.sort((a, b) => a.order_index - b.order_index);
  }, [filteredStops]);

  const stopsToRender = showMainStops ? mainStops : filteredStops;

  // Init map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: JUJUY_CENTER,
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("load", () => setMapLoaded(true));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
      markersRef.current = [];
    };
  }, []);

  // Render markers + route
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (map.getLayer("route-line")) map.removeLayer("route-line");
    if (map.getSource("route-line")) map.removeSource("route-line");

    if (!selectedLineId) return;
    if (filteredStops.length === 0) return;

    stopsToRender.forEach((stop) => {
      const isSelected = selectedStopId === stop.id;

      const el = document.createElement("div");
      el.style.width = isSelected ? "20px" : "16px";
      el.style.height = isSelected ? "20px" : "16px";
      el.style.borderRadius = "9999px";
      el.style.backgroundColor = isSelected ? "#f97316" : "#2563eb";
      el.style.border = isSelected ? "3px solid white" : "2px solid white";
      el.style.boxShadow = "0 0 6px rgba(0,0,0,0.45)";
      el.style.cursor = "pointer";

      const gmapsUrl = `https://www.google.com/maps?q=${stop.latitude},${stop.longitude}`;

      const html = `
        <div style="font-size:12px; line-height:1.35; min-width:220px;">
          <div style="font-weight:700; margin-bottom:6px;">${stop.name}</div>
          <div style="margin-bottom:6px;"><span style="opacity:.7;">Orden:</span> ${stop.order_index}</div>
          <a href="${gmapsUrl}" target="_blank" rel="noreferrer"
            style="display:inline-flex; gap:6px; align-items:center; padding:8px 10px; border-radius:10px; border:1px solid rgba(0,0,0,.12); text-decoration:none;">
            <span style="font-weight:600;">Abrir en Google Maps</span>
          </a>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([stop.longitude, stop.latitude])
        .setPopup(new maplibregl.Popup({ offset: 12 }).setHTML(html))
        .addTo(map);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onLineSelect(stop.line_id);
        onStopSelect(stop.id);
      });

      markersRef.current.push(marker);
    });

    if (filteredStops.length >= 2) {
      const coordinates = filteredStops.map((s) => [s.longitude, s.latitude]);

      map.addSource("route-line", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates },
          properties: {},
        },
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route-line",
        paint: {
          "line-width": 4,
          "line-color": selectedLine?.color || "#2563eb",
          "line-opacity": 0.9,
        },
      });

      const bounds = coordinates.reduce(
        (b, coord) => b.extend(coord as [number, number]),
        new maplibregl.LngLatBounds(
          coordinates[0] as [number, number],
          coordinates[0] as [number, number],
        ),
      );

      map.fitBounds(bounds, {
        padding: { top: 40, bottom: 40, left: 40, right: 40 },
        maxZoom: 16,
        duration: 600,
      });
    }
  }, [
    mapLoaded,
    selectedLineId,
    selectedStopId,
    stopsToRender,
    filteredStops,
    selectedLine,
    onLineSelect,
    onStopSelect,
  ]);

  const hasCoords = filteredStops.length > 0;

  return (
    <div className="w-full h-[420px] relative rounded-lg overflow-hidden border bg-background">
      <div className="absolute z-10 top-3 left-3 flex flex-col gap-2 rounded-md bg-background/90 backdrop-blur px-3 py-2 shadow-sm border">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="h-4 w-4 text-primary" />
          <span>Mapa de Transporte</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={showMainStops ? "default" : "outline"}
            onClick={() => setShowMainStops(true)}
            className="h-8 rounded-lg"
            disabled={!hasCoords}
          >
            Principales
          </Button>
          <Button
            type="button"
            size="sm"
            variant={!showMainStops ? "default" : "outline"}
            onClick={() => setShowMainStops(false)}
            className="h-8 rounded-lg"
            disabled={!hasCoords}
          >
            Todas
          </Button>
        </div>

        {selectedLine ? (
          <div className="text-xs text-muted-foreground">
            {hasCoords ? (
              <>
                {showMainStops ? "Mostrando principales" : "Mostrando todas"} ·{" "}
                <span className="font-semibold text-foreground">{stopsToRender.length}</span>
              </>
            ) : (
              <>
                <Clock className="inline h-3 w-3 mr-1" />
                Esta línea aún no tiene paradas con coordenadas
              </>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Seleccioná una línea para ver su recorrido
          </div>
        )}
      </div>

      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
