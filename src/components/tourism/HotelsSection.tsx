"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TourismHotel } from "@/components/types/TourismHotels";
import { MapPin, Star, Search } from "lucide-react";

type Props = {
  hotels: TourismHotel[];
  onOpenDetails: (hotel: TourismHotel) => void;
};

function starsLabel(stars?: number | null) {
  if (!stars || stars <= 0) return null;
  return `${stars}★`;
}

export function HotelsSection({ hotels, onOpenDetails }: Props) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const regions = useMemo(() => {
    const set = new Set<string>();
    hotels.forEach((h) => h.region && set.add(h.region));
    return Array.from(set).sort();
  }, [hotels]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    hotels.forEach((h) => h.category && set.add(h.category));
    return Array.from(set).sort();
  }, [hotels]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return hotels.filter((h) => {
      if (region !== "all" && (h.region || "") !== region) return false;
      if (category !== "all" && (h.category || "") !== category) return false;
      if (!q) return true;

      return (
        h.name.toLowerCase().includes(q) ||
        (h.description || "").toLowerCase().includes(q) ||
        (h.city || "").toLowerCase().includes(q) ||
        (h.address || "").toLowerCase().includes(q) ||
        (h.region || "").toLowerCase().includes(q)
      );
    });
  }, [hotels, search, region, category]);

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="rounded-3xl border border-border/70 bg-card/70 backdrop-blur-sm p-4 md:p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Search className="h-4 w-4" />
          <span>Buscar alojamiento</span>
          <span className="text-xs text-muted-foreground">
            ({filtered.length} de {hotels.length})
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre, zona, dirección…"
              className="pl-9"
            />
          </div>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Todas las regiones</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Todos los tipos</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {region !== "all" && (
            <Badge variant="secondary" className="rounded-full">
              Región: {region}
            </Badge>
          )}
          {category !== "all" && (
            <Badge variant="secondary" className="rounded-full">
              Tipo: {category}
            </Badge>
          )}
          {(region !== "all" || category !== "all" || search.trim()) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setRegion("all");
                setCategory("all");
              }}
              className="h-7 px-2 text-xs"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-border/70 bg-card/70 p-6 text-sm text-muted-foreground">
          No encontramos alojamientos con esos filtros.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h) => {
            const stars = starsLabel(h.stars);
            return (
              <Card
                key={h.id}
                className="overflow-hidden rounded-3xl border-border/70 hover:shadow-md transition-shadow"
              >
                <div className="aspect-[16/10] bg-muted relative">
                  {h.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={h.image_url}
                      alt={h.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                      Sin imagen
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex gap-2">
                    {h.booking_url ? (
                      <Badge className="rounded-full">Booking</Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-full">
                        Contacto directo
                      </Badge>
                    )}
                    {stars && (
                      <Badge variant="secondary" className="rounded-full flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {stars}
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold leading-tight">{h.name}</h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>
                        {(h.region || h.city || "Jujuy") +
                          (h.address ? ` · ${h.address}` : "")}
                      </span>
                    </div>

                    {h.category && (
                      <div className="pt-1">
                        <Badge variant="outline" className="rounded-full text-[11px]">
                          {h.category}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground line-clamp-3 min-h-[48px]">
                    {h.description || "Alojamiento disponible en Jujuy."}
                  </div>

                  <Button className="w-full rounded-2xl" onClick={() => onOpenDetails(h)}>
                    Ver disponibilidad
                  </Button>

                  <p className="text-[11px] text-muted-foreground mt-2">
                    {h.booking_url ? "Se confirma en Booking" : "Contacto directo"}
                  </p>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
