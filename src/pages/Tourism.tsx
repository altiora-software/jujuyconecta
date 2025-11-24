import { Layout } from "@/components/layout/Layout";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Mountain,
  Route as RouteIcon,
  Calendar,
  X
} from "lucide-react";
import { TourismMap } from "@/components/tourism/TourismMap";

interface TourismPlace {
  id: string;
  name: string;
  region: string;
  category: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude_meters: number | null;
  best_time_to_visit: string | null;
  image_url: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface TourismRoute {
  id: string;
  name: string;
  difficulty: "facil" | "media" | "dificil" | null;
  duration_hours: number | null;
  distance_km: number | null;
  short_description: string | null;
  long_description: string | null;
  start_municipality: string | null;
  end_municipality: string | null;
}

interface TourismEvent {
  id: string;
  title: string;
  municipality: string | null;
  date: string;
  category: string | null;
  location_detail: string | null;
  price_range: string | null;
  short_description: string | null;
  external_link: string | null;
}

type TourismTab = "places" | "map" | "routes" | "events";

export default function Tourism() {
  const [places, setPlaces] = useState<TourismPlace[]>([]);
  const [routes, setRoutes] = useState<TourismRoute[]>([]);
  const [events, setEvents] = useState<TourismEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TourismTab>("places");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsPlace, setDetailsPlace] = useState<TourismPlace | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [placesRes, routesRes, eventsRes] = await Promise.all([
        supabase
          .from("tourism_places")
          .select(
            `
              id,
              name,
              region,
              category,
              description,
              latitude,
              longitude,
              altitude_meters,
              best_time_to_visit,
              image_url,
              created_at,
              updated_at
            `
          )
          .order("region", { ascending: true })
          .order("name", { ascending: true }),
        supabase
          .from("tourism_routes")
          .select("*")
          .order("name", { ascending: true }),
        supabase
          .from("tourism_events")
          .select("*")
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })
          .limit(50),
      ]);

      if (placesRes.error) throw placesRes.error;
      if (routesRes.error) throw routesRes.error;
      if (eventsRes.error) throw eventsRes.error;

      setPlaces((placesRes.data as TourismPlace[]) || []);
      setRoutes((routesRes.data as TourismRoute[]) || []);
      setEvents((eventsRes.data as TourismEvent[]) || []);
    } catch (error: any) {
      console.error("Error fetching tourism data:", error);
      toast({
        title: "Error",
        description:
          error?.message ||
          "No se pudo cargar la información de turismo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const regions = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => {
      if (p.region) set.add(p.region);
    });
    return Array.from(set).sort();
  }, [places]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [places]);

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter)
        return false;
      if (regionFilter !== "all" && p.region !== regionFilter)
        return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.region || "").toLowerCase().includes(q)
      );
    });
  }, [places, categoryFilter, regionFilter, search]);

  const handleOpenDetails = (place: TourismPlace) => {
    setDetailsPlace(place);
    setDetailsOpen(true);
  };

  // cuando el mapa selecciona un lugar: centramos, abrimos modal
  const handlePlaceSelectFromMap = (id: string | null) => {
    setSelectedPlaceId(id);
    if (!id) return;

    const place = places.find((p) => p.id === id);
    if (place) {
      setDetailsPlace(place);
      setDetailsOpen(true);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-64 animate-pulse" />
            <div className="h-4 bg-muted rounded w-96 animate-pulse" />
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Turismo en Jujuy
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Descubrí lugares, rutas y eventos para conocer Jujuy como local.
            Todo curado para que puedas planificar mejor tu visita o tu fin
            de semana.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TourismTab)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="places">Lugares</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="routes">Rutas</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
          </TabsList>

          {/* LUGARES */}
          <TabsContent value="places" className="space-y-6">
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
                      onChange={(e) =>
                        setCategoryFilter(e.target.value)
                      }
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
                      onChange={(e) =>
                        setRegionFilter(e.target.value)
                      }
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
                  Mostrando {filteredPlaces.length} lugar(es)
                  turístico(s) en Jujuy.
                </p>
              </CardContent>
            </Card>

            {filteredPlaces.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">
                  Lugares para explorar
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPlaces.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onDetails={() => handleOpenDetails(place)}
                      onSeeOnMap={() => {
                        setSelectedPlaceId(place.id);
                        setActiveTab("map");
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredPlaces.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mountain className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    No encontramos lugares con esos filtros. Probá
                    ampliar la búsqueda.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* MAPA */}
          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Mapa turístico</CardTitle>
                <CardDescription>
                  Visualizá los principales puntos de interés de Jujuy
                  en un solo mapa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TourismMap
                  places={filteredPlaces as any}
                  selectedPlaceId={selectedPlaceId}
                  onPlaceSelect={handlePlaceSelectFromMap}
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Tocá un punto del mapa para ver el detalle del lugar
                  y el botón <strong>“Cómo llegar”</strong>.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RUTAS */}
          {/* (sin cambios, recorto para no hacer esto infinito, pero tu código de rutas/eventos sigue igual) */}

          <TabsContent value="routes" className="space-y-4">
            {/* ... tu bloque de rutas tal como lo tenías ... */}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            {/* ... tu bloque de eventos tal como lo tenías ... */}
          </TabsContent>
        </Tabs>
      </div>

      {/* MODAL DETALLE DE LUGAR */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mountain className="h-4 w-4 text-primary" />
              {detailsPlace?.name || "Detalle de lugar"}
            </DialogTitle>
            <DialogDescription>
              Información ampliada del punto turístico
            </DialogDescription>
          </DialogHeader>
          {/* MODAL DETALLE DE LUGAR */}
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent className="max-w-lg md:max-w-2xl p-0">
              <div className="flex flex-col max-h-[85vh]">
                {/* Header fijo con título y X */}
                <div className="flex items-start justify-between px-4 pt-4 pb-2 border-b">
                  <div className="space-y-1 pr-6">
                    <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
                      <Mountain className="h-4 w-4 text-primary" />
                      {detailsPlace?.name || "Detalle de lugar"}
                    </DialogTitle>
                    <DialogDescription className="text-xs md:text-sm">
                      Información ampliada del punto turístico.
                    </DialogDescription>
                  </div>

                  <DialogClose asChild>
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                    </button>
                  </DialogClose>
                </div>

                {/* Cuerpo scrolleable */}
                <div className="px-4 pb-4 pt-3 overflow-y-auto space-y-4">
                  {detailsPlace && (
                    <>
                      {/* Imagen */}
                      {detailsPlace.image_url && (
                        <div className="overflow-hidden rounded-lg border bg-black/5 flex items-center justify-center max-h-[260px] md:max-h-[380px]">
                          <img
                            src={detailsPlace.image_url}
                            alt={detailsPlace.name}
                            className="w-full h-auto object-contain max-h-[260px] md:max-h-[380px]"
                          />
                        </div>
                      )}

                      {/* Meta data */}
                      <div className="flex flex-wrap gap-2 text-[11px] md:text-xs text-muted-foreground">
                        {detailsPlace.region && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {detailsPlace.region}
                          </span>
                        )}

                        <Badge variant="outline">
                          {formatCategory(detailsPlace.category)}
                        </Badge>

                        {detailsPlace.altitude_meters && (
                          <Badge variant="secondary">
                            {detailsPlace.altitude_meters} msnm
                          </Badge>
                        )}

                        {detailsPlace.best_time_to_visit && (
                          <Badge variant="secondary">
                            Mejor época: {detailsPlace.best_time_to_visit}
                          </Badge>
                        )}
                      </div>

                      {/* Descripción */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Descripción</h4>

                        {detailsPlace.description ? (
                          <p className="text-[13px] md:text-sm text-muted-foreground whitespace-pre-line leading-snug">
                            {detailsPlace.description}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Próximamente vamos a sumar una descripción más completa para este lugar.
                          </p>
                        )}
                      </div>

                      {/* Cómo llegar */}
                      {detailsPlace.latitude && detailsPlace.longitude && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Cómo llegar</h4>

                          <p className="text-[11px] text-muted-foreground">
                            Google Maps va a trazar la ruta desde tu ubicación actual hasta este punto.
                          </p>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPlaceId(detailsPlace.id);
                                setActiveTab("map");
                                setDetailsOpen(false);
                              }}
                            >
                              Ver en mapa
                            </Button>

                            <Button size="sm" asChild>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${detailsPlace.latitude},${detailsPlace.longitude}&travelmode=driving`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Cómo llegar
                              </a>
                            </Button>
                          </div>

                          <p className="text-[11px] text-muted-foreground mt-1">
                            Coordenadas: {detailsPlace.latitude.toFixed(4)},{" "}
                            {detailsPlace.longitude.toFixed(4)}
                          </p>
                        </div>
                      )}

                      <Separator />

                      {/* Transporte público cercano (placeholder por ahora) */}
                      <div className="space-y-2 pb-1">
                        <h4 className="text-sm font-semibold">Transporte público cercano</h4>
                        <p className="text-[11px] md:text-xs text-muted-foreground leading-snug">
                          Muy pronto vas a ver acá las líneas de colectivo que te dejan cerca de este punto,
                          integradas con la sección de Transporte.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>


        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function PlaceCard({
  place,
  onDetails,
  onSeeOnMap,
}: {
  place: TourismPlace;
  onDetails: () => void;
  onSeeOnMap: () => void;
}) {
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

function formatCategory(category: string) {
  switch (category) {
    case "naturaleza":
      return "Naturaleza";
    case "cultura":
      return "Cultura y patrimonio";
    case "gastronomia":
      return "Gastronomía";
    case "aventura":
      return "Aventura";
    case "urbano":
      return "Turismo urbano";
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
}

function formatDifficulty(d: "facil" | "media" | "dificil") {
  if (d === "facil") return "Fácil";
  if (d === "media") return "Media";
  return "Difícil";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}
