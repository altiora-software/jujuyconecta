// src/components/tourism/RoutesSection.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Route as RouteIcon } from "lucide-react";
import { TourismRoute } from "@/components/types/tourism";
import { formatDifficulty } from "./utils";

interface RoutesSectionProps {
  routes: TourismRoute[];
}

export function RoutesSection({ routes }: RoutesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <RouteIcon className="h-5 w-5" />
            Rutas y recorridos sugeridos
          </h2>
          <p className="text-sm text-muted-foreground">
            Ideas de recorridos para organizar tu viaje por zonas o días.
          </p>
        </div>
      </div>

      {routes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RouteIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Todavía no cargamos rutas sugeridas, las vas a ver acá cuando estén listas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {routes.map((route) => (
            <Card
              key={route.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <RouteIcon className="h-4 w-4 text-primary" />
                  {route.name}
                </CardTitle>
                <CardDescription>
                  {route.start_municipality && route.end_municipality
                    ? `${route.start_municipality} → ${route.end_municipality}`
                    : "Recorrido provincial"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {route.short_description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {route.short_description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {route.difficulty && (
                    <Badge variant="outline">
                      Dificultad: {formatDifficulty(route.difficulty)}
                    </Badge>
                  )}
                  {route.duration_hours && (
                    <Badge variant="secondary">
                      Duración aprox: {route.duration_hours} h
                    </Badge>
                  )}
                  {route.distance_km && (
                    <Badge variant="secondary">
                      Distancia aprox: {route.distance_km} km
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
