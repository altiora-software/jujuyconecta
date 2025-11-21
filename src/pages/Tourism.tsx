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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Mountain,
  Route as RouteIcon,
  Calendar,
  Compass,
  SunMedium,
  Sparkles,
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
  created_at?: string;
  updated_at?: string;
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
            `,
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
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (regionFilter !== "all" && p.region !== regionFilter) return false;
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

  const totalPlaces = places.length;
  const totalRoutes = routes.length;
  const totalEvents = events.length;

  if (loading) {
    return (
      <Layout>
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-emerald-500/15 via-background to-background" />
          <div className="container mx-auto px-4 py-10 space-y-6">
            <div className="h-32 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-background to-sky-500/20 animate-pulse" />
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-3xl bg-muted/70 border border-border/60 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-emerald-500/14 via-background to-background" />
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
          {/* Hero */}
          <section className="grid gap-6 md:grid-cols-[minmax(0,1.7fr),minmax(0,1.1fr)] items-stretch">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-400/50 bg-gradient-to-br from-emerald-500/25 via-background to-sky-500/15 p-6 md:p-8 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
              <div className="absolute -right-24 -bottom-10 h-44 w-44 rounded-full bg-emerald-400/40 blur-2xl" />
              <div className="absolute left-6 bottom-6 h-20 w-20 rounded-full bg-sky-400/30 blur-2xl" />
              <div className="relative space-y-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/30 border border-emerald-200/70">
                    <Mountain className="h-5 w-5 text-black-50" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-black-50/80">
                      Turismo en Jujuy
                    </p>
                    <p className="text-[11px] text-black-50/70">
                      Naturaleza de altura, cultura viva y rutas únicas
                    </p>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black-50">
                  Planificá tu viaje
                </h1>
                <p className="text-sm md:text-base text-black-50/90 max-w-xl">
                  Descubrí pueblos, cerros, quebradas y selvas. Armá tu
                  recorrido por regiones, actividades y eventos sin perder
                  tiempo entre mil pestañas.
                </p>
                <div className="grid grid-cols-3 gap-3 text-xs mt-4">
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-500/20 p-3">
                    <p className="text-[11px] text-black-50 mb-1">
                      Lugares cargados
                    </p>
                    <p className="text-lg font-semibold text-black-50">
                      {totalPlaces}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-sky-200/80 bg-sky-500/20 p-3">
                    <p className="text-[11px] text-black-50 mb-1">
                      Rutas sugeridas
                    </p>
                    <p className="text-lg font-semibold text-black-50">
                      {totalRoutes}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-200/80 bg-amber-500/20 p-3">
                    <p className="text-[11px] text-amber-50 mb-1">
                      Próximos eventos
                    </p>
                    <p className="text-lg font-semibold text-amber-50">
                      {totalEvents}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel lateral info */}
            <div className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-5 md:p-6 flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Compass className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="space-y-1 text-sm">
                    <p>
                      Usá los filtros por región, categoría y el mapa
                      interactivo para armar tu propio itinerario por
                      Quebrada, Valles, Puna y Yungas.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vamos sumando información curada, fotos y datos
                      prácticos para que el turismo en Jujuy sea más
                      fácil y menos improvisado.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <SunMedium className="h-3.5 w-3.5 text-amber-500" />
                  <span>
                    Los datos de altura y mejor época te ayudan a
                    planificar según el clima y tu resistencia física.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-black-500" />
                  <span>
                    Queremos que uses Jujuy Conecta como tu base
                    central para recorrer la provincia, no solo como
                    un mapa más.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs principales */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TourismTab)}
            className="space-y-6"
          >
            <TabsList className="flex w-full flex-wrap gap-2 bg-muted/30 p-1 rounded-2xl">
              <TabsTrigger
                value="places"
                className="text-xs md:text-sm px-3 py-1.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Lugares
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="text-xs md:text-sm px-3 py-1.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Mapa
              </TabsTrigger>
              <TabsTrigger
                value="routes"
                className="text-xs md:text-sm px-3 py-1.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Rutas
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="text-xs md:text-sm px-3 py-1.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Eventos
              </TabsTrigger>
            </TabsList>

            {/* LUGARES */}
            <TabsContent value="places" className="space-y-6">
              <Card className="rounded-3xl border bg-card/90 backdrop-blur">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <label className="text-sm font-medium mb-1 block">
                        Buscar
                      </label>
                      <div className="relative">
                        <Input
                          placeholder="Cerro, pueblo, región, actividad…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pr-8"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Categoría
                      </label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
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
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
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
                    Mostrando {filteredPlaces.length} lugar
                    {filteredPlaces.length === 1 ? "" : "es"} turístico
                    {filteredPlaces.length === 1 ? "" : "s"} en Jujuy.
                  </p>
                </CardContent>
              </Card>

              {filteredPlaces.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <Mountain className="h-5 w-5 text-primary" />
                    Lugares para explorar
                  </h2>
                  <div className="grid gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                <Card className="rounded-3xl border-dashed">
                  <CardContent className="p-8 text-center">
                    <Mountain className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">
                      No encontramos lugares con esos filtros. Probá
                      ampliar la búsqueda o cambiar de región.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* MAPA */}
            <TabsContent value="map">
              <Card className="rounded-3xl border bg-card/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Mapa turístico
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Visualizá los principales puntos de interés de
                    Jujuy en un solo mapa. Tocá un marcador para ver el
                    nombre y más detalles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden border">
                    <TourismMap
                      places={filteredPlaces as any}
                      selectedPlaceId={selectedPlaceId}
                      onPlaceSelect={(id: string | null) =>
                        setSelectedPlaceId(id)
                      }
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span className="inline-flex h-3 w-3 rounded-full bg-primary/70" />
                    Usá los filtros de la pestaña Lugares para reducir
                    los puntos en el mapa según región o tipo de
                    actividad.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* RUTAS */}
            <TabsContent value="routes" className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <RouteIcon className="h-5 w-5 text-primary" />
                    Rutas y recorridos sugeridos
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Ideas de recorridos por días o por zonas para
                    combinar pueblos, atractivos y paisajes sin perder
                    tiempo reinventando el mapa.
                  </p>
                </div>
              </div>

              {routes.length === 0 ? (
                <Card className="rounded-3xl border-dashed">
                  <CardContent className="p-8 text-center">
                    <RouteIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">
                      Todavía no cargamos rutas sugeridas, las vas a ver
                      acá cuando estén listas.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {routes.map((route) => (
                    <Card
                      key={route.id}
                      className="rounded-3xl border bg-gradient-to-br from-emerald-500/7 via-background to-sky-500/7 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                          <RouteIcon className="h-4 w-4 text-primary" />
                          {route.name}
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm">
                          {route.start_municipality &&
                          route.end_municipality
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
                              Dificultad:{" "}
                              {formatDifficulty(route.difficulty)}
                            </Badge>
                          )}
                          {route.duration_hours && (
                            <Badge variant="secondary">
                              Duración aprox:{" "}
                              {route.duration_hours} h
                            </Badge>
                          )}
                          {route.distance_km && (
                            <Badge variant="secondary">
                              Distancia aprox:{" "}
                              {route.distance_km} km
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* EVENTOS */}
            <TabsContent value="events" className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Agenda de eventos
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Próximas fiestas, festivales, ferias y actividades
                    turísticas en la provincia. Ideal para decidir qué
                    fin de semana vale la pena viajar.
                  </p>
                </div>
              </div>

              {events.length === 0 ? (
                <Card className="rounded-3xl border-dashed">
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">
                      Por ahora no hay eventos publicados, volvé a
                      revisar más adelante.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative pl-4 md:pl-6 space-y-3">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-border/60" />
                  {events.map((event) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-2 top-4 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                      <Card className="ml-2 rounded-2xl border bg-card/95">
                        <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-sm md:text-base">
                                {event.title}
                              </h3>
                              {event.category && (
                                <Badge variant="outline" className="text-xs">
                                  {event.category}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(event.date)}
                              </span>
                              {event.municipality && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.municipality}
                                </span>
                              )}
                              {event.location_detail && (
                                <span>{event.location_detail}</span>
                              )}
                              {event.price_range && (
                                <Badge variant="secondary">
                                  {event.price_range}
                                </Badge>
                              )}
                            </div>
                            {event.short_description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {event.short_description}
                              </p>
                            )}
                          </div>
                          {event.external_link && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 md:mt-0"
                              asChild
                            >
                              <a
                                href={event.external_link}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Ver más información
                              </a>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* MODAL DETALLE DE LUGAR */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mountain className="h-4 w-4 text-primary" />
              {detailsPlace?.name || "Detalle de lugar"}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Información ampliada del punto turístico
            </DialogDescription>
          </DialogHeader>

          {detailsPlace && (
            <div className="space-y-4">
              {detailsPlace.image_url && (
                <div className="w-full overflow-hidden rounded-2xl border bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={detailsPlace.image_url}
                    alt={detailsPlace.name}
                    className="max-h-[60vh] w-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {detailsPlace.region && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    {detailsPlace.region}
                  </Badge>
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

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Descripción</h4>
                {detailsPlace.description ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {detailsPlace.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Próximamente vamos a sumar una descripción más
                    completa para este lugar.
                  </p>
                )}
              </div>

              {detailsPlace.latitude && detailsPlace.longitude && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">
                    Ubicación aproximada
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPlaceId(detailsPlace.id);
                      setActiveTab("map");
                      setDetailsOpen(false);
                    }}
                  >
                    Ver en el mapa de turismo
                  </Button>
                </div>
              )}
            </div>
          )}
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
  const hasImage = Boolean(place.image_url);

  return (
    <article className="group relative flex flex-col rounded-3xl border bg-gradient-to-br from-emerald-500/6 via-background to-sky-500/6 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-transform duration-200">
      {hasImage && (
        <div className="relative h-36 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={place.image_url as string}
            alt={place.name}
            className="h-full w-full object-cover transform group-hover:scale-[1.03] transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          <div className="absolute left-3 bottom-3 flex items-center gap-2">
            {place.region && (
              <Badge
                variant="secondary"
                className="bg-white/90 text-xs px-2 py-0.5 inline-flex items-center gap-1"
              >
                <MapPin className="h-3 w-3" />
                {place.region}
              </Badge>
            )}
            <Badge variant="outline" className="bg-black/40 text-white border-white/40 text-[11px]">
              {formatCategory(place.category)}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className={`pb-1 ${hasImage ? "pt-4" : "pt-5"}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base md:text-lg line-clamp-2">
              {place.name}
            </CardTitle>
            {!hasImage && place.region && (
              <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                <MapPin className="h-3 w-3" />
                <span>{place.region}</span>
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 pb-4">
        {place.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {place.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 text-xs">
          {!hasImage && (
            <Badge variant="outline">
              {formatCategory(place.category)}
            </Badge>
          )}
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
          <Button size="sm" onClick={onDetails} className="h-8 text-xs">
            Ver detalles
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onSeeOnMap}
            className="h-8 text-xs"
          >
            Ver en mapa
          </Button>
        </div>
      </CardContent>
    </article>
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
      return category
        ? category.charAt(0).toUpperCase() + category.slice(1)
        : "";
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
