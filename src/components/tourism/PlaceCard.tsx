// src/components/tourism/PlaceCard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { TourismPlace } from "@/components/types/tourism";
import { formatCategory } from "./utils";
import { Button } from "@/components/ui/button";

interface PlaceCardProps {
  place: TourismPlace;
  onDetails: () => void;
  onSeeOnMap: () => void;
}

export function PlaceCard({ place, onDetails, onSeeOnMap }: PlaceCardProps) {
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      {place.image_url && (
        <div className="h-32 w-full overflow-hidden rounded-t-lg border-b">
          <img
            src={place.image_url}
            alt={place.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base line-clamp-2">
              {place.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              {place.region && (
                <>
                  <MapPin className="h-3 w-3" />
                  <span>{place.region}</span>
                </>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        {place.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {place.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">
            {formatCategory(place.category)}
          </Badge>
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
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button size="sm" onClick={onDetails}>
            Ver detalles
          </Button>
          <Button size="sm" variant="outline" onClick={onSeeOnMap}>
            Ver en mapa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
