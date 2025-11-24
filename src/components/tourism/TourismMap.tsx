// src/components/tourism/TourismMap.tsx
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Database } from "@/integrations/supabase/types";

type TourismPlace = Database["public"]["Tables"]["tourism_places"]["Row"];

interface UserLocation {
  lat: number;
  lng: number;
}

interface TourismMapProps {
  places: TourismPlace[];
  selectedPlaceId: string | null;
  onPlaceSelect: (id: string | null) => void;
  userLocation?: UserLocation | null;
  routeToPlaceId?: string | null;
}

const JUJUY_BOUNDS: [[number, number], [number, number]] = [
  [-67.4, -25.6],
  [-64, -21.5],
];

export const TourismMap = ({
  places,
  selectedPlaceId,
  onPlaceSelect,
  userLocation,
  routeToPlaceId,
}: TourismMapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Record<string, maplibregl.Marker>>({});
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  // init mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      } as any,
      center: [-65.3, -24.2],
      zoom: 6.5,
      renderWorldCopies: false,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-left");
    map.current.setMaxBounds(JUJUY_BOUNDS);

    return () => {
      Object.values(markers.current).forEach((m) => m.remove());
      markers.current = {};
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      // limpiar capa de ruta si existe
      if (map.current?.getLayer("user-route")) {
        map.current.removeLayer("user-route");
      }
      if (map.current?.getSource("user-route")) {
        map.current.removeSource("user-route");
      }
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // markers de lugares
  useEffect(() => {
    if (!map.current) return;

    Object.values(markers.current).forEach((m) => m.remove());
    markers.current = {};

    const bounds = new maplibregl.LngLatBounds();
    let hasPoints = false;

    places.forEach((place) => {
      if (
        place.latitude == null ||
        place.longitude == null ||
        !isFinite(place.latitude) ||
        !isFinite(place.longitude)
      ) {
        return;
      }

      const lng = Number(place.longitude);
      const lat = Number(place.latitude);

      const el = document.createElement("div");
      const isSelected = selectedPlaceId === place.id;

      el.style.width = isSelected ? "20px" : "14px";
      el.style.height = isSelected ? "20px" : "14px";
      el.style.borderRadius = "9999px";
      el.style.backgroundColor = isSelected ? "#0ea5e9" : "#2563eb";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 6px rgba(0,0,0,0.3)";
      el.style.cursor = "pointer";

      const name = place.name || "Lugar turístico";
      const region = (place as any).region || "";
      const cat = (place as any).category || "";
      const popupHtml = `
        <div style="min-width:200px;max-width:260px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <h3 style="margin:0 0 4px;font-size:14px;font-weight:600;color:#111827;">
            ${escapeHtml(name)}
          </h3>
          ${
            region
              ? `<p style="margin:0 0 4px;font-size:12px;color:#4b5563;">${escapeHtml(
                  region,
                )}</p>`
              : ""
          }
          ${
            cat
              ? `<p style="margin:0;font-size:11px;color:#6b7280;">${escapeHtml(
                  cat,
                )}</p>`
              : ""
          }
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibregl.Popup({
            anchor: "top",
            offset: 12,
            closeButton: false,
            maxWidth: "280px",
          }).setHTML(popupHtml),
        )
        .addTo(map.current!);

      el.addEventListener("click", () => {
        onPlaceSelect(place.id);
        marker.togglePopup();
      });

      markers.current[place.id] = marker;
      bounds.extend([lng, lat]);
      hasPoints = true;
    });

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const padding = {
      top: isMobile ? 60 : 80,
      right: isMobile ? 16 : 24,
      bottom: 24,
      left: isMobile ? 16 : 24,
    };

    if (hasPoints) {
      map.current.fitBounds(bounds, { padding, maxZoom: 12, duration: 0 });
    } else {
      map.current.fitBounds(JUJUY_BOUNDS, { padding, duration: 0 });
    }
  }, [places, selectedPlaceId, onPlaceSelect]);

  // marcador de usuario + ruta simple
  useEffect(() => {
    if (!map.current) return;

    // limpiar capa de ruta previa
    if (map.current.getLayer("user-route")) {
      map.current.removeLayer("user-route");
    }
    if (map.current.getSource("user-route")) {
      map.current.removeSource("user-route");
    }

    // limpiar marcador de usuario
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (!userLocation) return;

    const { lat, lng } = userLocation;

    const el = document.createElement("div");
    el.style.width = "18px";
    el.style.height = "18px";
    el.style.borderRadius = "9999px";
    el.style.backgroundColor = "#22c55e";
    el.style.border = "2px solid white";
    el.style.boxShadow = "0 0 6px rgba(0,0,0,0.4)";

    const userMarker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .setPopup(
        new maplibregl.Popup({
          anchor: "top",
          offset: 10,
          closeButton: false,
        }).setText("Tu ubicación aproximada"),
      )
      .addTo(map.current);

    userMarkerRef.current = userMarker;

    // si hay lugar destino, dibujar línea
    if (routeToPlaceId) {
      const place = places.find((p) => p.id === routeToPlaceId);
      if (
        place &&
        place.latitude != null &&
        place.longitude != null &&
        isFinite(place.latitude) &&
        isFinite(place.longitude)
      ) {
        const destLng = Number(place.longitude);
        const destLat = Number(place.latitude);

        map.current.addSource("user-route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [lng, lat],
                [destLng, destLat],
              ],
            },
            properties: {},
          },
        });

        map.current.addLayer({
          id: "user-route",
          type: "line",
          source: "user-route",
          paint: {
            "line-width": 4,
            "line-color": "#22c55e",
            "line-opacity": 0.9,
          },
        });

        const bounds = new maplibregl.LngLatBounds(
          [lng, lat],
          [destLng, destLat],
        );

        map.current.fitBounds(bounds, {
          padding: { top: 60, bottom: 40, left: 40, right: 40 },
          maxZoom: 13,
          duration: 400,
        });
      }
    }
  }, [userLocation, routeToPlaceId, places]);

  // centrar y resaltar cuando cambia selectedPlaceId
  useEffect(() => {
    if (!map.current || !selectedPlaceId) return;
    const place = places.find((p) => p.id === selectedPlaceId);
    if (!place || place.latitude == null || place.longitude == null) return;

    const lng = Number(place.longitude);
    const lat = Number(place.latitude);

    map.current.easeTo({
      center: [lng, lat],
      zoom: Math.max(map.current.getZoom(), 11),
      duration: 300,
    });

    const marker = markers.current[selectedPlaceId];
    if (marker) {
      const popup = marker.getPopup();
      if (popup && !popup.isOpen()) {
        popup.addTo(map.current);
      }
    }
  }, [selectedPlaceId, places]);

  return (
    <div ref={mapContainer} className="w-full h-[420px] rounded-lg border" />
  );
};

// util simple para evitar scripts en el popup
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
