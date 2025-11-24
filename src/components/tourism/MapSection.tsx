// src/components/tourism/MapSection.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TourismPlace } from "@/components/types/tourism";
import { TourismMap } from "@/components/tourism/TourismMap";

interface MapSectionProps {
  places: TourismPlace[];
  selectedPlaceId: string | null;
  onPlaceSelect: (id: string | null) => void;
}

export function MapSection({
  places,
  selectedPlaceId,
  onPlaceSelect,
}: MapSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa turístico</CardTitle>
        <CardDescription>
          Visualizá los principales puntos de interés de Jujuy en un solo mapa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TourismMap
          places={places as any}
          selectedPlaceId={selectedPlaceId}
          onPlaceSelect={onPlaceSelect}
        />
        <p className="mt-3 text-xs text-muted-foreground">
          Tocá un punto del mapa para ver el detalle del lugar y el botón{" "}
          <strong>“Cómo llegar”</strong>.
        </p>
      </CardContent>
    </Card>
  );
}
