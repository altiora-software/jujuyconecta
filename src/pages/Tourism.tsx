// src/app/turismo/page.tsx
"use client";

import { Layout } from "@/components/layout/Layout";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { TourismPlace, TourismRoute, TourismTab } from "@/components/types/tourism";
import { TourismHotel } from "@/components/types/TourismHotels";

import { PlacesSection } from "@/components/tourism/PlacesSection";
import { MapSection } from "@/components/tourism/MapSection";
import { RoutesSection } from "@/components/tourism/RoutesSection";
import { PlaceDetailsDialog } from "@/components/tourism/PlaceDetailsDialog";
import { HotelDetailsDialog } from "@/components/tourism/HotelDetailsDialog";

import { formatCategory } from "@/components/tourism/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Mountain, Map, Info, Building2, Star, MapPin } from "lucide-react";

// Helper GA4: dispara eventos si gtag existe
function trackGAEvent(eventName: string, params?: Record<string, any>): void {
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
  // -----------------------------
  // Data
  // -----------------------------
  const [places, setPlaces] = useState<TourismPlace[]>([]);
  const [routes, setRoutes] = useState<TourismRoute[]>([]);
  const [hotels, setHotels] = useState<TourismHotel[]>([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Tabs
  // -----------------------------
  const [activeTab, setActiveTab] = useState<TourismTab>("places");

  // -----------------------------
  // Filters: PLACES
  // -----------------------------
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  // -----------------------------
  // Filters: HOTELS (separado para no pisar lugares)
  // -----------------------------
  const [hotelSearch, setHotelSearch] = useState("");
  const [hotelRegionFilter, setHotelRegionFilter] = useState<string>("all");
  const [hotelOnlyActive, setHotelOnlyActive] = useState<boolean>(true);

  // -----------------------------
  // Dialog: PLACE DETAILS
  // -----------------------------
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsPlace, setDetailsPlace] = useState<TourismPlace | null>(null);

  // -----------------------------
  // Dialog: HOTEL DETAILS
  // -----------------------------
  const [hotelDetailsOpen, setHotelDetailsOpen] = useState(false);
  const [detailsHotel, setDetailsHotel] = useState<TourismHotel | null>(null);

  // -----------------------------
  // UI
  // -----------------------------
  const [showInfo, setShowInfo] = useState(false);

  const { toast } = useToast();

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
      const [placesRes, routesRes, hotelsRes] = await Promise.all([
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

        supabase.from("tourism_routes").select("*").order("name", { ascending: true }),

        supabase
          .from("tourism_hotels")
          .select(
            `
              id,
              name,
              slug,
              region,
              city,
              address,
              latitude,
              longitude,
              stars,
              category,
              description,
              amenities,
              phone,
              whatsapp,
              website,
              image_url,
              booking_url,
              active,
              created_at,
              updated_at
            `
          )
          .order("region", { ascending: true })
          .order("name", { ascending: true }),
      ]);

      if (placesRes.error) throw placesRes.error;
      if (routesRes.error) throw routesRes.error;
      if (hotelsRes.error) throw hotelsRes.error;

      setPlaces((placesRes.data as TourismPlace[]) || []);
      setRoutes((routesRes.data as TourismRoute[]) || []);
      setHotels((hotelsRes.data as TourismHotel[]) || []);
    } catch (error: any) {
      console.error("Error fetching tourism data:", error);
      toast({
        title: "Error",
        description: error?.message || "No se pudo cargar la información de turismo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Derived: regions/categories
  // -----------------------------
  const regions = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => p.region && set.add(p.region));
    return Array.from(set).sort();
  }, [places]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [places]);

  const hotelRegions = useMemo(() => {
    const set = new Set<string>();
    hotels.forEach((h) => h.region && set.add(h.region));
    return Array.from(set).sort();
  }, [hotels]);

  // -----------------------------
  // Filtered PLACES
  // -----------------------------
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

  // -----------------------------
  // Filtered HOTELS
  // -----------------------------
  const filteredHotels = useMemo(() => {
    const q = hotelSearch.trim().toLowerCase();

    return hotels.filter((h) => {
      if (hotelOnlyActive && !h.active) return false;
      if (hotelRegionFilter !== "all" && (h.region || "") !== hotelRegionFilter) return false;

      if (!q) return true;

      const hay = `${h.name} ${h.region || ""} ${h.city || ""} ${h.category || ""} ${h.address || ""}`.toLowerCase();

      return hay.includes(q);
    });
  }, [hotels, hotelSearch, hotelRegionFilter, hotelOnlyActive]);

  // -----------------------------
  // Place details
  // -----------------------------
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
    trackGAEvent("tourism_see_on_map_from_dialog", { place_id: id });
  };

  // -----------------------------
  // Hotel details
  // -----------------------------
  const handleOpenHotelDetails = (hotel: TourismHotel) => {
    setDetailsHotel(hotel);
    setHotelDetailsOpen(true);
    trackGAEvent("tourism_hotel_details_open", {
      hotel_id: hotel.id,
      hotel_name: hotel.name,
      region: hotel.region,
      city: hotel.city,
      category: hotel.category,
      has_booking: !!hotel.booking_url,
    });
  };

  // -----------------------------
  // GA wrappers
  // -----------------------------
  const handleTabChange = (v: string) => {
    setActiveTab(v as TourismTab);
    trackGAEvent("tourism_tab_change", { tab: v });
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    trackGAEvent("tourism_filter_category_change", { category: value || "all" });
  };

  const handleRegionFilterChange = (value: string) => {
    setRegionFilter(value);
    trackGAEvent("tourism_filter_region_change", { region: value || "all" });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value.trim().length >= 3) trackGAEvent("tourism_search", { query: value.trim() });
  };

  const handleHotelSearchChange = (value: string) => {
    setHotelSearch(value);
    if (value.trim().length >= 3) trackGAEvent("tourism_hotel_search", { query: value.trim() });
  };

  const handleHotelRegionChange = (value: string) => {
    setHotelRegionFilter(value);
    trackGAEvent("tourism_hotel_filter_region_change", { region: value || "all" });
  };

  const handleHotelOnlyActiveToggle = () => {
    setHotelOnlyActive((v) => {
      const next = !v;
      trackGAEvent("tourism_hotel_filter_active_toggle", { only_active: next });
      return next;
    });
  };

  // -----------------------------
  // Totals
  // -----------------------------
  const totalPlaces = places.length;
  const totalRoutes = routes.length;
  const totalRegions = regions.length;
  const totalHotels = hotels.length;

  const hotelsMissingBooking = useMemo(() => hotels.filter((h) => !h.booking_url).length, [hotels]);
  const hotelsMissingImage = useMemo(() => hotels.filter((h) => !h.image_url).length, [hotels]);

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
      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 min-w-0">
        {/* HERO Turismo */}
        <section className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)] items-stretch min-w-0">
          {/* Card principal */}
          <div className="relative overflow-hidden rounded-3xl border border-sky-400/40 bg-gradient-to-br from-sky-500/20 via-background to-background p-5 sm:p-6 lg:p-8 min-w-0">
            <div className="absolute -right-20 -top-10 h-40 w-40 rounded-full bg-sky-400/30 blur-2xl" />

            <div className="flex items-center gap-3 mb-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/25 border border-sky-300/60 shrink-0">
                <Mountain className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Turismo en Jujuy
                </p>
                <p className="text-xs text-muted-foreground">
                  Lugares, rutas y hoteles para explorar la provincia
                </p>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight mb-2 break-words">
              Mapa vivo del turismo en Jujuy
            </h1>

            <button
              type="button"
              onClick={() => setShowInfo((v) => !v)}
              className="text-[11px] sm:text-xs text-muted-foreground underline-offset-2 hover:underline mb-2 inline-flex items-center gap-1"
            >
              {showInfo ? "Ocultar explicación" : "Ver cómo usar esta sección"}
              <span className={`transition-transform ${showInfo ? "rotate-180" : ""}`}>▾</span>
            </button>

            {showInfo && (
              <p className="text-sm text-muted-foreground max-w-2xl mb-4">
                Explorá los Valles, Quebrada, Yungas y Puna como local. Buscá lugares por región o categoría,
                abrí el mapa para ver cómo llegar, revisá rutas sugeridas y encontrá hoteles para reservar sin perder tiempo.
              </p>
            )}

            {/* Stats: estable en mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div className="rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-3">
                <p className="text-[11px] text-muted-foreground mb-1">Lugares</p>
                <p className="text-lg font-semibold">{totalPlaces}</p>
              </div>

              <div className="rounded-2xl border border-sky-300/40 bg-sky-500/10 p-3">
                <p className="text-[11px] text-muted-foreground mb-1">Rutas</p>
                <p className="text-lg font-semibold">{totalRoutes}</p>
              </div>

              <div className="rounded-2xl border border-purple-300/40 bg-purple-500/10 p-3">
                <p className="text-[11px] text-muted-foreground mb-1">Regiones</p>
                <p className="text-lg font-semibold">{totalRegions}</p>
              </div>

              <div className="rounded-2xl border border-fuchsia-300/40 bg-fuchsia-500/10 p-3">
                <p className="text-[11px] text-muted-foreground mb-1">Hoteles</p>
                <p className="text-lg font-semibold">{totalHotels}</p>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-5 sm:p-6 flex flex-col justify-between gap-5 min-w-0">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div className="space-y-1 text-sm min-w-0">
                  {showInfo ? (
                    <>
                      <p className="break-words">
                        Usá las pestañas para recorrer: lugares, mapa, rutas y hoteles.
                      </p>
                      <p className="text-xs text-muted-foreground break-words">
                        Hoteles: si tienen Booking, abrís la reserva con fechas y huéspedes precargados, si no, contacto directo.
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground break-words">
                      Tocá “Ver cómo usar…” si querés una explicación más clara para aprovechar la sección.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 text-[11px]">
                <Badge variant="secondary" className="rounded-full">
                  Hoteles sin imagen: {hotelsMissingImage}
                </Badge>
                <Badge
                  variant={hotelsMissingBooking > 0 ? "outline" : "secondary"}
                  className="rounded-full"
                >
                  Hoteles sin Booking: {hotelsMissingBooking}
                </Badge>
              </div>

              <div className="flex flex-col gap-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Map className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                  <span className="break-words">
                    Abrí el mapa para ver lugares por región y planear tu recorrido.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-fuchsia-500 shrink-0" />
                  <span className="break-words">
                    Hoteles: reservá rápido o contactá directo si falta Booking.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENIDO PRINCIPAL: TABS */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-5 sm:space-y-6">
          {/* 4 tabs, estable en mobile */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2">
            <TabsTrigger value="places" className="rounded-2xl">
              Lugares
            </TabsTrigger>
            <TabsTrigger value="map" className="rounded-2xl">
              Mapa
            </TabsTrigger>
            <TabsTrigger value="routes" className="rounded-2xl">
              Rutas
            </TabsTrigger>
            <TabsTrigger value="hotels" className="rounded-2xl">
              Hoteles
            </TabsTrigger>
          </TabsList>

          {/* LUGARES */}
          <TabsContent value="places" className="min-w-0">
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
                trackGAEvent("tourism_see_on_map_from_list", { place_id: id });
              }}
              formatCategory={formatCategory}
            />
          </TabsContent>

          {/* MAPA */}
          <TabsContent value="map" className="min-w-0">
            <MapSection
              places={filteredPlaces}
              selectedPlaceId={selectedPlaceId}
              onPlaceSelect={handlePlaceSelectFromMap}
            />
          </TabsContent>

          {/* RUTAS */}
          <TabsContent value="routes" className="min-w-0">
            <RoutesSection routes={routes} />
          </TabsContent>

          {/* HOTELES */}
          <TabsContent value="hotels" className="min-w-0">
            <div className="space-y-5 min-w-0">
              {/* Filters */}
              <div className="rounded-3xl border border-border/70 bg-card/70 p-4 sm:p-5 min-w-0">
                <div className="grid gap-3 sm:grid-cols-[1fr,220px,auto] sm:items-end min-w-0">
                  <div className="space-y-1 min-w-0">
                    <div className="text-sm font-medium">Buscar hotel</div>
                    <Input
                      value={hotelSearch}
                      onChange={(e) => handleHotelSearchChange(e.target.value)}
                      placeholder="Nombre, región, ciudad, categoría..."
                      className="h-11 rounded-2xl w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium">Región</div>
                    <select
                      className="h-11 w-full rounded-2xl border bg-background px-3 text-sm"
                      value={hotelRegionFilter}
                      onChange={(e) => handleHotelRegionChange(e.target.value)}
                    >
                      <option value="all">Todas</option>
                      {hotelRegions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="button"
                    variant={hotelOnlyActive ? "default" : "outline"}
                    className="h-11 rounded-2xl w-full sm:w-auto"
                    onClick={handleHotelOnlyActiveToggle}
                  >
                    {hotelOnlyActive ? "Solo activos" : "Incluye inactivos"}
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <Badge variant="secondary" className="rounded-full">
                    Mostrando: {filteredHotels.length}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    Total: {totalHotels}
                  </Badge>
                  <Badge
                    variant={hotelsMissingImage > 0 ? "destructive" : "secondary"}
                    className="rounded-full"
                  >
                    Sin imagen: {hotelsMissingImage}
                  </Badge>
                  <Badge
                    variant={hotelsMissingBooking > 0 ? "outline" : "secondary"}
                    className="rounded-full"
                  >
                    Sin Booking: {hotelsMissingBooking}
                  </Badge>
                </div>
              </div>

              {/* List */}
              {filteredHotels.length === 0 ? (
                <div className="rounded-3xl border border-border/70 bg-card/50 p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No hay hoteles con esos filtros. Probá cambiar región o limpiar el buscador.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
                  {filteredHotels.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => handleOpenHotelDetails(h)}
                      className="text-left rounded-3xl border border-border/70 bg-card/70 hover:bg-card transition-colors overflow-hidden w-full min-w-0"
                    >
                      {/* image: ratio fijo para que no “salte” */}
                      <div className="w-full aspect-[16/10] bg-muted">
                        {h.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={h.image_url}
                            alt={h.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      {/* content */}
                      <div className="p-4 space-y-2 min-w-0">
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <div className="min-w-0">
                            <div className="font-semibold leading-tight line-clamp-2 break-words">
                              {h.name}
                            </div>

                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1 min-w-0">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="line-clamp-1">
                                {(h.region || h.city || "Jujuy") +
                                  (h.address ? ` · ${h.address}` : "")}
                              </span>
                            </div>
                          </div>

                          {typeof h.stars === "number" ? (
                            <Badge
                              variant="secondary"
                              className="rounded-full inline-flex items-center gap-1 shrink-0"
                            >
                              <Star className="h-3 w-3" />
                              {h.stars}★
                            </Badge>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2 text-[11px]">
                          {h.category ? (
                            <Badge variant="outline" className="rounded-full">
                              {h.category}
                            </Badge>
                          ) : null}
                          {h.booking_url ? (
                            <Badge className="rounded-full">Booking</Badge>
                          ) : (
                            <Badge variant="secondary" className="rounded-full">
                              Contacto directo
                            </Badge>
                          )}
                          <Badge
                            variant={h.active ? "secondary" : "outline"}
                            className="rounded-full"
                          >
                            {h.active ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>

                        {h.description ? (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {h.description}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Tocá para ver detalles y reservar.
                          </p>
                        )}

                        {/* micro-CTA visual sin romper nada */}
                        <div className="pt-1">
                          <span className="text-[11px] text-primary">
                            Ver ficha
                            <span className="ml-1">→</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog lugar */}
      <PlaceDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        place={detailsPlace}
        onSeeOnMap={handleSeeOnMapFromDialog}
      />

      {/* Dialog hotel */}
      <HotelDetailsDialog
        open={hotelDetailsOpen}
        onOpenChange={setHotelDetailsOpen}
        hotel={detailsHotel}
      />
    </Layout>
  );
}
