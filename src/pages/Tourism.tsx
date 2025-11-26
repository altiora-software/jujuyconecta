// src/app/turismo/page.tsx
"use client";

import { Layout } from "@/components/layout/Layout";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  TourismPlace,
  TourismRoute,
  TourismEvent,
  TourismTab,
} from "@/components/types/tourism";
import { PlacesSection } from "@/components/tourism/PlacesSection";
import { MapSection } from "@/components/tourism/MapSection";
import { RoutesSection } from "@/components/tourism/RoutesSection";
import { EventsSection } from "@/components/tourism/EventsSection";
import { PlaceDetailsDialog } from "@/components/tourism/PlaceDetailsDialog";
import { formatCategory } from "@/components/tourism/utils";
import {
  Mountain,
  Map,
  CalendarRange,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Helper GA4: dispara eventos si gtag existe
function trackGAEvent(
  eventName: string,
  params?: Record<string, any>
): void {
  if (typeof window === "undefined") return;
  const gtag = (window as any).gtag;
  if (!gtag) return;
  gtag("event", eventName, {
    page: "/turismo",
    section: "tourism",
    ...params,
  });
}

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

  const [showInfo, setShowInfo] = useState(false);

  const { toast } = useToast();

  // Page view específica de Turismo
  useEffect(() => {
    trackGAEvent("tourism_page_view", {
      page_location: typeof window !== "undefined" ? window.location.href : "",
    });
  }, []);

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
          error?.message || "No se pudo cargar la información de turismo.",
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
    trackGAEvent("tourism_place_details_open", {
      place_id: place.id,
      place_name: place.name,
      region: place.region,
      category: place.category,
    });
  };

  // cuando el mapa selecciona un lugar
  const handlePlaceSelectFromMap = (id: string | null) => {
    setSelectedPlaceId(id);
    if (!id) return;
    const place = places.find((p) => p.id === id);
    if (place) {
      setDetailsPlace(place);
      setDetailsOpen(true);
      trackGAEvent("tourism_place_select_from_map", {
        place_id: place.id,
        place_name: place.name,
        region: place.region,
        category: place.category,
      });
    }
  };

  const handleSeeOnMapFromDialog = (id: string) => {
    setSelectedPlaceId(id);
    setActiveTab("map");
    trackGAEvent("tourism_see_on_map_from_dialog", {
      place_id: id,
    });
  };

  // wrappers con GA para filtros y búsqueda
  const handleTabChange = (v: string) => {
    setActiveTab(v as TourismTab);
    trackGAEvent("tourism_tab_change", {
      tab: v,
    });
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    trackGAEvent("tourism_filter_category_change", {
      category: value || "all",
    });
  };

  const handleRegionFilterChange = (value: string) => {
    setRegionFilter(value);
    trackGAEvent("tourism_filter_region_change", {
      region: value || "all",
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    // solo logueamos búsquedas mínimamente intencionales
    if (value.trim().length >= 3) {
      trackGAEvent("tourism_search", {
        query: value.trim(),
      });
    }
  };

  const totalPlaces = places.length;
  const totalRoutes = routes.length;
  const totalEvents = events.length;
  const totalRegions = regions.length;

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
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* HERO Turismo, alineado con transporte y empleos */}
        <section className="grid gap-6 md:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)] items-stretch">
          {/* Card principal */}
          <div className="relative overflow-hidden rounded-3xl border border-sky-400/40 bg-gradient-to-br from-sky-500/20 via-background to-background p-6 md:p-8 shadow-[0_0_40px_rgba(56,189,248,0.35)]">
            <div className="absolute -right-20 -top-10 h-40 w-40 rounded-full bg-sky-400/30 blur-2xl" />

            <div className="flex items-center gap-3 mb-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/25 border border-sky-300/60">
                <Mountain className="h-5 w-5 text-black-50" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs uppercase tracking-[0.2em] text-black-100/80">
                  Turismo en Jujuy
                </p>
                <p className="text-xs text-black-100/70">
                  Lugares, rutas y eventos para explorar la provincia
                </p>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black-50 mb-2">
              Mapa vivo del turismo en Jujuy
            </h1>

            {/* Toggle de explicación */}
            <button
              type="button"
              onClick={() => setShowInfo((v) => !v)}
              className="text-[11px] md:text-xs text-black-50/80 underline-offset-2 hover:underline mb-2 inline-flex items-center gap-1"
            >
              {showInfo
                ? "Ocultar explicación"
                : "Ver cómo usar esta sección de turismo"}
              <span
                className={`transition-transform ${
                  showInfo ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>

            {/* Texto largo solo si el usuario lo pide */}
            {showInfo && (
              <p className="text-sm md:text-base text-black-50/85 max-w-xl mb-4">
                Explorá los Valles, Quebrada, Yungas y Puna como local. Buscá
                lugares por región o categoría, abrí el mapa para ver cómo
                llegar y revisá rutas sugeridas y eventos activos para armar tu
                propia escapada de fin de semana o tu viaje completo por Jujuy.
              </p>
            )}

            {/* Stats de turismo */}
            <div className="grid grid-cols-4 gap-3 text-xs md:text-sm">
              <div className="rounded-2xl border border-emerald-300/70 bg-emerald-500/15 p-3">
                <p className="text-[11px] text-black-50 mb-1">Lugares</p>
                <p className="text-lg font-semibold text-black-50">
                  {totalPlaces}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-300/70 bg-sky-500/15 p-3">
                <p className="text-[11px] text-black-50 mb-1">Rutas</p>
                <p className="text-lg font-semibold text-black-50">
                  {totalRoutes}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-300/70 bg-amber-500/15 p-3">
                <p className="text-[11px] text-amber-50 mb-1">Eventos</p>
                <p className="text-lg font-semibold text-amber-50">
                  {totalEvents}
                </p>
              </div>
              <div className="rounded-2xl border border-purple-300/70 bg-purple-500/15 p-3">
                <p className="text-[11px] text-black-50 mb-1">Regiones</p>
                <p className="text-lg font-semibold text-black-50">
                  {totalRegions}
                </p>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-5 md:p-6 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 mt-0.5 text-primary" />
                <div className="space-y-1 text-sm">
                  {showInfo ? (
                    <>
                      <p>
                        Usá las pestañas de abajo para recorrer la información:
                        primero la lista de lugares, después el mapa, las rutas
                        armadas y por último los eventos que se vienen.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Si instalás Jujuy Conecta como app, tenés este mapa
                        turístico a un toque desde tu pantalla de inicio, ideal
                        para moverte mientras viajás.
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Tocá “Ver cómo usar esta sección de turismo” si querés una
                      explicación más detallada para sacarle el jugo a los
                      lugares, mapa, rutas y eventos.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <Map className="h-3.5 w-3.5 text-sky-500" />
                <span>
                  Abrí el mapa para ver por región, filtrá lugares por tipo y
                  guardá los que quieras visitar. Jujuy entero en un solo
                  lugar.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarRange className="h-3.5 w-3.5 text-emerald-500" />
                <span>
                  Mirá los eventos activos para planear fines de semana largos,
                  fiestas patronales y actividades especiales en cada zona.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENIDO PRINCIPAL: TABS */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
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
              setSearch={handleSearchChange}
              categoryFilter={categoryFilter}
              setCategoryFilter={handleCategoryFilterChange}
              regionFilter={regionFilter}
              setRegionFilter={handleRegionFilterChange}
              categories={categories}
              regions={regions}
              onOpenDetails={handleOpenDetails}
              onSeeOnMap={(id) => {
                setSelectedPlaceId(id);
                setActiveTab("map");
                trackGAEvent("tourism_see_on_map_from_list", {
                  place_id: id,
                });
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
