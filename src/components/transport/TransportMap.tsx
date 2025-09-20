import React, { useRef, useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";

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

// Coordenadas de San Salvador de Jujuy
const JUJUY_CENTER = {
  lat: -24.1858,
  lng: -65.2995
};

export function TransportMap({ lines, stops, selectedLineId, onLineSelect }: TransportMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [map, setMap] = useState<any>(null);

  const initializeMap = async () => {
    if (!mapboxToken || !mapContainer.current) return;

    try {
      const mapboxgl = await import('mapbox-gl');
      await import('mapbox-gl/dist/mapbox-gl.css');
      
      mapboxgl.default.accessToken = mapboxToken;
      
      const mapInstance = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [JUJUY_CENTER.lng, JUJUY_CENTER.lat],
        zoom: 13,
      });

      mapInstance.addControl(
        new mapboxgl.default.NavigationControl(),
        'top-right'
      );

      // Add markers for stops
      stops.forEach((stop) => {
        const line = lines.find(l => l.id === stop.line_id);
        if (!line || (selectedLineId && stop.line_id !== selectedLineId)) return;

        const marker = new mapboxgl.default.Marker({
          color: line.color || '#2563EB'
        })
        .setLngLat([stop.longitude, stop.latitude])
        .setPopup(
          new mapboxgl.default.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${stop.name}</h3>
              <p class="text-sm text-gray-600">Línea ${line.number} - ${line.name}</p>
            </div>
          `)
        )
        .addTo(mapInstance);
      });

      setMap(mapInstance);
      setShowTokenInput(false);
    } catch (error) {
      console.error('Error loading map:', error);
    }
  };

  useEffect(() => {
    if (mapboxToken) {
      initializeMap();
    }
  }, [mapboxToken, selectedLineId, stops]);

  if (showTokenInput) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-center space-y-2">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold">Mapa de Transporte</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Para ver el mapa interactivo con las paradas de colectivos, necesitamos un token de Mapbox.
          </p>
        </div>
        
        <div className="flex gap-2 w-full max-w-md">
          <Input
            type="text"
            placeholder="Token público de Mapbox"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <Button 
            onClick={initializeMap}
            disabled={!mapboxToken.trim()}
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Obtén tu token gratuito en{' '}
          <a 
            href="https://mapbox.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            mapbox.com
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}