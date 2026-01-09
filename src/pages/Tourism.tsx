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

import { Mountain, Map, Info, Building2, Star, MapPin, Search, Compass, Navigation } from "lucide-react";

function trackGAEvent(eventName: string, params?: Record<string, any>): void {
  if (typeof window === "undefined") return;
  const gtag = (window as any).gtag;
  if (!gtag) return;
  gtag("event", eventName, { page: "/turismo", section: "tourism", ...params });
}

export default function Tourism() {
  const [places, setPlaces] = useState<TourismPlace[]>([]);
  const [routes, setRoutes] = useState<TourismRoute[]>([]);
  const [hotels, setHotels] = useState<TourismHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TourismTab>("places");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [hotelSearch, setHotelSearch] = useState("");
  const [hotelRegionFilter, setHotelRegionFilter] = useState<string>("all");
  const [hotelOnlyActive, setHotelOnlyActive] = useState<boolean>(true);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsPlace, setDetailsPlace] = useState<TourismPlace | null>(null);
  const [hotelDetailsOpen, setHotelDetailsOpen] = useState(false);
  const [detailsHotel, setDetailsHotel] = useState<TourismHotel | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    trackGAEvent("tourism_page_view");
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [placesRes, routesRes, hotelsRes] = await Promise.all([
        supabase.from("tourism_places").select("*").order("region", { ascending: true }),
        supabase.from("tourism_routes").select("*").order("name", { ascending: true }),
        supabase.from("tourism_hotels").select("*").order("region", { ascending: true }),
      ]);
      setPlaces(placesRes.data || []);
      setRoutes(routesRes.data || []);
      setHotels(hotelsRes.data || []);
    } catch (error: any) {
      toast({ title: "Error", description: "No se pudo cargar la info.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const regions = useMemo(() => Array.from(new Set(places.map(p => p.region))).filter(Boolean).sort(), [places]);
  const hotelRegions = useMemo(() => Array.from(new Set(hotels.map(h => h.region))).filter(Boolean).sort(), [hotels]);
  const categories = useMemo(() => Array.from(new Set(places.map(p => p.category))).filter(Boolean).sort(), [places]);

  const filteredHotels = useMemo(() => {
    const q = hotelSearch.trim().toLowerCase();
    return hotels.filter((h) => {
      if (hotelOnlyActive && !h.active) return false;
      if (hotelRegionFilter !== "all" && h.region !== hotelRegionFilter) return false;
      return !q || `${h.name} ${h.region} ${h.city}`.toLowerCase().includes(q);
    });
  }, [hotels, hotelSearch, hotelRegionFilter, hotelOnlyActive]);

  const handleTabChange = (v: string) => {
    setActiveTab(v as TourismTab);
    trackGAEvent("tourism_tab_change", { tab: v });
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:py-10 space-y-10 min-w-0">
        
        {/* HERO INNOVADOR */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 sm:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 bg-[url('https://www.jujuyconecta.com/wp-content/uploads/2023/07/jujuy-conecta-bg.jpg')] bg-cover bg-center mix-blend-overlay" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-4 rounded-full text-xs font-bold uppercase tracking-widest">
              Explorá lo auténtico
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">
              JUJUY ES <br /><span className="text-primary italic">INFINITO</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              Tu guía definitiva para recorrer la Quebrada, Puna, Valles y Yungas. Todo en un solo lugar.
            </p>
          </div>
        </section>

        {/* TABS INNOVADORES: Segmented Control & Floating Dock */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-12">
          
          <div className="flex justify-center sticky top-20 z-40">
            <TabsList className="relative flex h-16 w-full max-w-2xl items-center justify-between gap-0 rounded-full border border-white/10 bg-slate-900/80 p-2 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:h-20">
              
              {/* Esta es la lógica del "Indicador Flotante" */}
              {[
                { id: "places", label: "Lugares", icon: Mountain },
                { id: "map", label: "Mapa", icon: Navigation },
                { id: "routes", label: "Rutas", icon: Compass },
                { id: "hotels", label: "Hoteles", icon: Building2 },
              ].map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="relative z-10 flex h-full flex-1 items-center justify-center gap-2 rounded-full text-xs font-bold transition-all data-[state=active]:text-slate-950 data-[state=inactive]:text-slate-400 sm:text-sm"
                >
                  <t.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">{t.label}</span>
                  
                  {activeTab === t.id && (
                    <div className="absolute inset-0 z-[-1] rounded-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.4)] animate-in zoom-in-90 duration-300" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* CONTENIDO DE LUGARES */}
          <TabsContent value="places" className="animate-in fade-in slide-in-from-bottom-10 duration-700">
            <PlacesSection
              places={places}
              filteredPlaces={places.filter(p => (search === "" || p.name.toLowerCase().includes(search.toLowerCase())) && (categoryFilter === "all" || p.category === categoryFilter) && (regionFilter === "all" || p.region === regionFilter))}
              search={search}
              setSearch={setSearch}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              regionFilter={regionFilter}
              setRegionFilter={setRegionFilter}
              categories={categories}
              regions={regions}
              onOpenDetails={(p) => { setDetailsPlace(p); setDetailsOpen(true); }}
              onSeeOnMap={(id) => { setSelectedPlaceId(id); setActiveTab("map"); }}
              formatCategory={formatCategory}
            />
          </TabsContent>

          {/* CONTENIDO DE MAPA */}
          <TabsContent value="map" className="h-[70vh] rounded-[3rem] overflow-hidden border-8 border-slate-900 shadow-2xl">
            <MapSection places={places} selectedPlaceId={selectedPlaceId} onPlaceSelect={(id) => { if(!id) return; const p = places.find(x => x.id === id); if(p) { setDetailsPlace(p); setDetailsOpen(true); } }} />
          </TabsContent>

          {/* CONTENIDO DE RUTAS */}
          <TabsContent value="routes">
            <RoutesSection routes={routes} />
          </TabsContent>

          {/* CONTENIDO DE HOTELES */}
          <TabsContent value="hotels" className="space-y-10 animate-in zoom-in-95 duration-500">
            
            {/* FILTROS HOTELES ESTILO DASHBOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px,200px] gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-[2.5rem] border border-slate-200 dark:border-white/10">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  value={hotelSearch}
                  onChange={(e) => setHotelSearch(e.target.value)}
                  placeholder="Buscá por nombre o ciudad..."
                  className="h-16 rounded-full border-none bg-white dark:bg-slate-900 pl-14 shadow-sm text-lg"
                />
              </div>
              <select
                className="h-16 rounded-full bg-white dark:bg-slate-900 border-none px-8 font-bold text-slate-500 appearance-none shadow-sm cursor-pointer"
                value={hotelRegionFilter}
                onChange={(e) => setHotelRegionFilter(e.target.value)}
              >
                <option value="all">Todas las regiones</option>
                {hotelRegions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <Button
                onClick={() => setHotelOnlyActive(!hotelOnlyActive)}
                className={`h-16 rounded-full font-black uppercase tracking-tighter text-sm transition-all shadow-lg active:scale-95 ${hotelOnlyActive ? 'bg-primary text-slate-950' : 'bg-slate-800 text-white'}`}
              >
                {hotelOnlyActive ? 'Disponibles' : 'Ver Todos'}
              </Button>
            </div>

            {/* LISTA DE HOTELES EN GRID DINÁMICO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredHotels.map((h) => (
                <div
                  key={h.id}
                  onClick={() => { setDetailsHotel(h); setHotelDetailsOpen(true); }}
                  className="group relative cursor-pointer overflow-hidden rounded-[3rem] bg-card border border-slate-100 dark:border-white/5 transition-all hover:border-primary/50 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2"
                >
                  <div className="relative aspect-[4/3]">
                    <img src={h.image_url || "/images/placeholder-hotel.jpg"} alt={h.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                      <div className="space-y-1">
                        <Badge className="bg-primary text-slate-950 font-black border-none">{h.region}</Badge>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{h.name}</h3>
                      </div>
                      {h.stars && (
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-bold">
                          {h.stars}<Star className="h-3 w-3 fill-primary text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-medium">
                      {h.description || "Un refugio único para conectar con la magia de Jujuy."}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                      <span className="text-xs font-black uppercase tracking-widest text-primary italic">Ver Detalles</span>
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-slate-950 transition-colors">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <PlaceDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} place={detailsPlace} onSeeOnMap={(id) => { setSelectedPlaceId(id); setActiveTab("map"); }} />
      <HotelDetailsDialog open={hotelDetailsOpen} onOpenChange={setHotelDetailsOpen} hotel={detailsHotel} />
    </Layout>
  );
}

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);