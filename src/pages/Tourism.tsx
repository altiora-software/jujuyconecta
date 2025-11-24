// src/app/turismo/page.tsx  (o pages/turismo.tsx según tu estructura)
import { Layout } from "@/components/layout/Layout";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { TourismPlace, TourismRoute, TourismEvent, TourismTab } from "@/components/types/tourism";
import { PlacesSection } from "@/components/tourism/PlacesSection";
import { MapSection } from "@/components/tourism/MapSection";
import { RoutesSection } from "@/components/tourism/RoutesSection";
import { EventsSection } from "@/components/tourism/EventsSection";
import { PlaceDetailsDialog } from "@/components/tourism/PlaceDetailsDialog";
import { formatCategory } from "@/components/tourism/utils";

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

  // cuando el mapa selecciona un lugar
  const handlePlaceSelectFromMap = (id: string | null) => {
    setSelectedPlaceId(id);
    if (!id) return;
    const place = places.find((p) => p.id === id);
    if (place) {
      setDetailsPlace(place);
      setDetailsOpen(true);
    }
  };

  const handleSeeOnMapFromDialog = (id: string) => {
    setSelectedPlaceId(id);
    setActiveTab("map");
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
          <TabsContent value="places">
            <PlacesSection
              places={places}
              filteredPlaces={filteredPlaces}
              search={search}
              setSearch={setSearch}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              regionFilter={regionFilter}
              setRegionFilter={setRegionFilter}
              categories={categories}
              regions={regions}
              onOpenDetails={handleOpenDetails}
              onSeeOnMap={(id) => {
                setSelectedPlaceId(id);
                setActiveTab("map");
              }}
              formatCategory={formatCategory}
            />
          </TabsContent>

          {/* MAPA */}
          <TabsContent value="map">
            <MapSection
              places={filteredPlaces}
              selectedPlaceId={selectedPlaceId}
              onPlaceSelect={handlePlaceSelectFromMap}
            />
          </TabsContent>

          {/* RUTAS */}
          <TabsContent value="routes">
            <RoutesSection routes={routes} />
          </TabsContent>

          {/* EVENTOS */}
          <TabsContent value="events">
            <EventsSection events={events} />
          </TabsContent>
        </Tabs>
      </div>

      <PlaceDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        place={detailsPlace}
        onSeeOnMap={handleSeeOnMapFromDialog}
      />
    </Layout>
  );
}
