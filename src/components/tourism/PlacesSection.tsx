// src/components/tourism/PlacesSection.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mountain } from "lucide-react";
import { TourismPlace } from "@/components/types/tourism";
import { PlaceCard } from "./PlaceCard";

interface PlacesSectionProps {
  places: TourismPlace[];
  filteredPlaces: TourismPlace[];
  search: string;
  setSearch: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  regionFilter: string;
  setRegionFilter: (value: string) => void;
  categories: string[];
  regions: string[];
  onOpenDetails: (place: TourismPlace) => void;
  onSeeOnMap: (id: string) => void;
  formatCategory: (category: string) => string;
}

export function PlacesSection({
  filteredPlaces,
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  regionFilter,
  setRegionFilter,
  categories,
  regions,
  onOpenDetails,
  onSeeOnMap,
  formatCategory,
}: PlacesSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="text-sm font-medium mb-1 block">
                Buscar
              </label>
              <Input
                placeholder="Cerro, pueblo, región, actividad…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Categoría
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Todas</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {formatCategory(c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Región
              </label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Toda la provincia</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Mostrando {filteredPlaces.length} lugar(es) turístico(s) en Jujuy.
          </p>
        </CardContent>
      </Card>

      {filteredPlaces.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            Lugares para explorar
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onDetails={() => onOpenDetails(place)}
                onSeeOnMap={() => onSeeOnMap(place.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Mountain className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No encontramos lugares con esos filtros. Probá ampliar la búsqueda.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
