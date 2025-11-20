import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin, Clock } from "lucide-react";

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
  onLineSelect: (lineId: string) => void;
}

const JUJUY_CENTER: [number, number] = [-65.2971, -24.1858];

export function TransportMap({
  lines,
  stops,
  selectedLineId,
}: TransportMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const mapLoadedRef = useRef(false);
  const userLocationRef = useRef<maplibregl.Marker | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  
  const selectedLine = useMemo(
    () => lines.find((l) => l.id === selectedLineId),
    [lines, selectedLineId],
  );

  const filteredStops = useMemo(() => {
    const base = selectedLineId
      ? stops.filter((s) => s.line_id === selectedLineId)
      : stops;

    const cleaned = [...base]
      .filter(
        (s) =>
          typeof s.latitude === "number" &&
          !Number.isNaN(s.latitude) &&
          typeof s.longitude === "number" &&
          !Number.isNaN(s.longitude),
      )
      .sort((a, b) => a.order_index - b.order_index);

    console.log("filteredStops for map", {
      selectedLineId,
      count: cleaned.length,
    });

    return cleaned;
  }, [stops, selectedLineId]);

  // Inicializar mapa 1 sola vez
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [
          pos.coords.longitude,
          pos.coords.latitude,
        ];
        setUserCoords(coords);
    
        if (mapRef.current) {
          // Centrar un poco mejor cuando se obtiene posición
          mapRef.current.flyTo({
            center: coords,
            zoom: 14,
          });
        }
      },
      (err) => {
        console.warn("No se pudo obtener la ubicación", err);
      },
      { enableHighAccuracy: true }
    );
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style:
        "https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: JUJUY_CENTER,
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      mapLoadedRef.current = true;
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      mapLoadedRef.current = false;
      markersRef.current = [];
    };
  }, []);

  // Pintar paradas y recorrido
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!mapLoadedRef.current) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Limpiar línea anterior
    if (map.getLayer("route-line")) map.removeLayer("route-line");
    if (map.getSource("route-line")) map.removeSource("route-line");

    // Sin paradas: zoom general
    if (!filteredStops.length) {
      map.setCenter(JUJUY_CENTER);
      map.setZoom(12);
      return;
    }

    // Marcadores HTML numerados
    filteredStops.forEach((stop, idx) => {
      const el = document.createElement("div");
      el.style.width = "16px";
      el.style.height = "16px";
      el.style.borderRadius = "9999px";
      el.style.backgroundColor = "#2563eb";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 4px rgba(0,0,0,0.4)";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.fontSize = "9px";
      el.style.color = "white";
      el.style.fontWeight = "bold";
      el.style.boxSizing = "border-box";
      el.textContent = String(idx + 1);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([stop.longitude, stop.latitude]) // [lng, lat]
        .setPopup(
          new maplibregl.Popup({ offset: 12 }).setHTML(
            `<div style="font-size:12px;">
              <strong>${stop.name}</strong><br/>
              Orden: ${stop.order_index}
            </div>`,
          ),
        )
        .addTo(map);

      markersRef.current.push(marker);
    });
    if (map && userCoords) {
      // borrar marcador anterior
      if (userLocationRef.current) {
        userLocationRef.current.remove();
      }
    
      const marker = new maplibregl.Marker({
        color: "#00c853", // verde
      })
        .setLngLat(userCoords)
        .setPopup(
          new maplibregl.Popup().setHTML(
            `<strong>Estás acá</strong>`
          )
        )
        .addTo(map);
    
      userLocationRef.current = marker;
    }
    // Dibujar polilínea
    if (filteredStops.length >= 2) {
      const coordinates = filteredStops.map((s) => [
        s.longitude,
        s.latitude,
      ]);

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
    } else {
      // Una sola parada
      const only = filteredStops[0];
      map.setCenter([only.longitude, only.latitude]);
      map.setZoom(15);
    }
  }, [filteredStops, selectedLine]);

  return (
    <div className="w-full h-[420px] relative rounded-lg overflow-hidden border bg-background">
      <div className="absolute z-10 top-3 left-3 flex flex-col gap-1 rounded-md bg-background/90 backdrop-blur px-3 py-2 shadow-sm border">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="h-4 w-4 text-primary" />
          <span>Mapa de Transporte</span>
        </div>
        {selectedLine ? (
          <div className="text-xs text-muted-foreground">
            Línea seleccionada:{" "}
            <span className="font-semibold text-primary">
              {selectedLine.number} · {selectedLine.name}
            </span>
            <span className="ml-1">· {filteredStops.length} paradas</span>
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
