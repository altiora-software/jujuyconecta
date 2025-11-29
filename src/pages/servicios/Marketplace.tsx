"use client";

import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Store,
  ShoppingBag,
  MapPin,
  Search,
  Phone,
  Instagram,
  Globe,
  Sparkles,
  Filter,
  Truck,
  MessageCircle,
  Clock,
  Share2,
  Edit3,
  ChevronDown,
} from "lucide-react";
import {
  buildEditRequestWhatsApp,
  shareBusiness,
} from "@/components/marketplace/helpers";
import { NewBusinessDialog } from "@/components/marketplace/NewBusinessDialog";

export interface LocalBusiness {
  id: string;
  name: string;
  category: string;
  type: string; // texto en la tabla, esperamos "producto" | "servicio" | "emprendimiento"
  municipality: string;
  address?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  instagram?: string | null;
  website?: string | null;
  image_url?: string | null;
  source_url?: string | null;
  source_type?: string | null;
  tags?: string[] | null;
  has_delivery?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
  updated_at?: string;
  is_featured?: boolean | null;
}

const TABS = [
  { id: "todos", label: "Todo Jujuy", icon: Store },
  { id: "productos", label: "Productos", icon: ShoppingBag },
  { id: "servicios", label: "Servicios", icon: Sparkles },
];

export default function MarketplacePage() {
  const [items, setItems] = useState<LocalBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [selectedMunicipality, setSelectedMunicipality] =
    useState<string>("todos");
  const [selectedItem, setSelectedItem] = useState<LocalBusiness | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showOwnerBox, setShowOwnerBox] = useState(false);
  
  // nuevo: diálogo de "sumar emprendimiento"
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  

  const { toast } = useToast();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("local_businesses")
          .select("*")
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error cargando local_businesses", error);
          toast({
            title: "Error al cargar el marketplace",
            description:
              "No se pudieron cargar los emprendimientos. Probá de nuevo en unos minutos.",
            variant: "destructive",
          });
          return;
        }

        setItems((data || []) as LocalBusiness[]);
      } catch (err) {
        console.error("Error inesperado en MarketplacePage", err);
        toast({
          title: "Error inesperado",
          description: "Ocurrió un problema cargando los datos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [toast]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort();
  }, [items]);

  const municipalities = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.municipality) set.add(item.municipality);
    });
    return Array.from(set).sort();
  }, [items]);

  const totalItems = items.length;
  const totalMunicipalities = municipalities.length;
  const totalCategories = categories.length;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedTab === "productos" && item.type !== "producto") return false;
      if (selectedTab === "servicios" && item.type !== "servicio") return false;

      if (selectedCategory !== "todas" && item.category !== selectedCategory) {
        return false;
      }

      if (
        selectedMunicipality !== "todos" &&
        item.municipality !== selectedMunicipality
      ) {
        return false;
      }

      if (searchTerm.trim().length > 0) {
        const term = searchTerm.toLowerCase();
        const dataHaystack = [
          item.name,
          item.category,
          item.municipality,
          item.address,
          item.tags?.join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!dataHaystack.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [
    items,
    selectedTab,
    selectedCategory,
    selectedMunicipality,
    searchTerm,
  ]);

  const handleOpenDetails = (item: LocalBusiness) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleClearFilters = () => {
    setSelectedCategory("todas");
    setSelectedMunicipality("todos");
    setSearchTerm("");
    setSelectedTab("todos");
  };

  const formatTypeLabel = (type?: string | null) => {
    if (!type) return "Emprendimiento local";
    const t = type.toLowerCase();
    if (t === "producto") return "Producto";
    if (t === "servicio") return "Servicio";
    if (t === "emprendimiento") return "Emprendimiento";
    return "Emprendimiento local";
  };

  const buildWhatsAppLink = (phone?: string | null, name?: string) => {
    if (!phone) return null;
    const clean = phone.replace(/[^\d]/g, "");
    const texto = encodeURIComponent(
      `Hola, vi tu emprendimiento en el Marketplace de Jujuy Conecta y quiero más info sobre: ${
        name ?? "tu emprendimiento"
      }.`
    );
    return `https://wa.me/${clean}?text=${texto}`;
  };

  const isNewItem = (createdAt?: string) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays =
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-6 md:py-10 space-y-8">
        {/* Hero y contexto */}
        <section className="space-y-5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs md:text-sm shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Marketplace Local de Jujuy · versión beta</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                Encontrá emprendedores, comercios y servicios,
                <span className="text-primary">
                  {" "}
                  y hablales directo por WhatsApp.
                </span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Nada de formularios eternos. Elegís el emprendimiento, ves qué
                ofrece y en un toque escribís a la persona que está detrás del
                proyecto.
              </p>

              {/* Stats */}
              <div className="mt-2 grid grid-cols-3 gap-3 max-w-xs text-xs md:text-sm">
                <div className="rounded-lg border bg-card/70 px-3 py-2">
                  <p className="font-semibold">{totalItems}</p>
                  <p className="text-muted-foreground text-[11px]">
                    emprendimientos
                  </p>
                </div>
                <div className="rounded-lg border bg-card/70 px-3 py-2">
                  <p className="font-semibold">{totalMunicipalities}</p>
                  <p className="text-muted-foreground text-[11px]">
                    municipios
                  </p>
                </div>
                <div className="rounded-lg border bg-card/70 px-3 py-2">
                  <p className="font-semibold">{totalCategories}</p>
                  <p className="text-muted-foreground text-[11px]">rubros</p>
                </div>
              </div>
            </div>

            <div className="w-full lg:max-w-sm">
            <button
              type="button"
              onClick={() => setShowOwnerBox((prev) => !prev)}
              className="
                w-full flex items-center justify-between gap-2
                rounded-lg border bg-background px-3 py-2
                text-xs md:text-sm font-medium
                hover:bg-muted/70 transition-colors
              "
              aria-expanded={showOwnerBox}
            >
              <span className="flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                ¿Tenés un emprendimiento? Sumate al Marketplace
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showOwnerBox ? "rotate-180" : ""
                }`}
              />
            </button>

            {showOwnerBox && (
              <Card className="mt-3 border-dashed shadow-sm bg-gradient-to-b from-background to-muted/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    Sumá tu emprendimiento
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Completás un formulario corto y revisamos tu ficha antes de
                    publicarla en el Marketplace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 pt-0 text-xs md:text-sm">
                  <p className="text-muted-foreground">Qué vas a tener:</p>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    <li>Aparición en el mapa de Jujuy Conecta.</li>
                    <li>Botón directo a tu WhatsApp e Instagram.</li>
                    <li>Rubro, zona y etiquetas para que te encuentren fácil.</li>
                  </ul>
                  <Button
                    size="sm"
                    className="w-full mt-1"
                    onClick={() => setNewDialogOpen(true)}
                  >
                    Abrir formulario
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          </div>

          <Separator />

          {/* Buscador y filtros */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por producto, servicio, rubro o barrio"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleClearFilters}
                title="Limpiar filtros"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <select
                className="h-9 rounded-md border bg-background px-3 text-xs md:text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="todas">Todos los rubros</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                className="h-9 rounded-md border bg-background px-3 text-xs md:text-sm"
                value={selectedMunicipality}
                onChange={(e) => setSelectedMunicipality(e.target.value)}
              >
                <option value="todos">Toda la provincia</option>
                {municipalities.map((mun) => (
                  <option key={mun} value={mun}>
                    {mun}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="space-y-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="flex gap-2 justify-start">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="
                    flex items-center gap-2 px-4 py-2 rounded-md text-xs md:text-sm font-medium
                    border transition-all
                    data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:border-emerald-600
                    data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 data-[state=inactive]:border-gray-300
                    hover:bg-gray-100
                  "
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>


            <TabsContent value={selectedTab} className="mt-4">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse rounded-xl" >
                      <CardHeader className="pb-3">
                        <div className="h-4 w-32 bg-muted rounded mb-2" />
                        <div className="h-3 w-24 bg-muted rounded" />
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="h-3 w-full bg-muted rounded" />
                        <div className="h-3 w-2/3 bg-muted rounded" />
                        <div className="flex gap-2 pt-2">
                          <div className="h-6 w-16 bg-muted rounded-full" />
                          <div className="h-6 w-20 bg-muted rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <Store className="h-8 w-8 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="font-medium">
                      Todavía no hay resultados para este filtro.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Probá con otra palabra, cambiá de rubro o quitá alguno de
                      los filtros.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Quitar filtros
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((item) => {
                    const whatsappLink = buildWhatsAppLink(
                      item.whatsapp ?? item.phone,
                      item.name
                    );
                    const isNew = isNewItem(item.created_at);
                    const createdShort = formatDate(item.created_at);

                    return (
                      <Card
                        key={item.id}
                        onClick={() => handleOpenDetails(item)}
                        className="
                          group flex flex-col rounded-xl 
                          border border-border/100 
                          bg-background 
                          shadow-sm 
                          hover:shadow-md 
                          hover:border-primary/40
                          transition-all
                          hover:-translate-y-[2px]
                        "
                      >

                        {/* Imagen o placeholder */}
                        <div className="relative h-40 w-full overflow-hidden rounded-t-xl bg-muted flex items-center justify-center">
                          {item.image_url ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

                              {/* Badges */}
                              <div className="absolute left-2 top-2 flex flex-col gap-1">
                                {item.is_featured && (
                                  <Badge className="text-[10px] md:text-xs bg-yellow-500 text-black flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Destacado
                                  </Badge>
                                )}
                                {isNew && (
                                  <Badge className="text-[10px] md:text-xs bg-emerald-500 text-white">
                                    Nuevo
                                  </Badge>
                                )}
                              </div>

                              {item.has_delivery && (
                                <Badge className="absolute right-2 bottom-2 text-[10px] md:text-xs flex items-center gap-1 bg-background/900 backdrop-blur">
                                  <Truck className="h-3 w-3" />
                                  Envío
                                </Badge>
                              )}
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-muted-foreground bg-muted/30 w-full h-full justify-center">
                            <Store className="h-6 w-6" />
                              <span className="text-[11px]">Sin imagen disponible</span>
                            </div>
                          )}
                        </div>

                        <CardHeader className="pb-2 pt-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 w-full">
                              <div className="flex items-center gap-2">
                                <CardTitle className="flex-1 text-base md:text-lg line-clamp-1">
                                  {item.name}
                                </CardTitle>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  className="shrink-0"
                                  onClick={() => shareBusiness(item, toast)}
                                  title="Compartir ficha"
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <CardDescription className="text-xs md:text-sm line-clamp-2">
                                {item.address ||
                                  `${item.category} en ${item.municipality}`}
                              </CardDescription>
                              {/* {createdShort && (
                                <p className="text-[10px] text-muted-foreground">
                                  Actualizado: {createdShort}
                                </p>
                              )} */}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0 pb-3 flex-1 flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs md:text-[13px] text-muted-foreground">
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 text-[11px] border-dashed"
                            >
                              <Sparkles className="h-3 w-3" />
                              {formatTypeLabel(item.type)}
                            </Badge>

                            {item.category && (
                              <Badge
                                variant="secondary"
                                className="text-[11px]"
                              >
                                {item.category}
                              </Badge>
                            )}

                            {item.municipality && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {item.municipality}
                              </span>
                            )}
                          </div>

                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {item.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-[10px] md:text-[11px] font-normal"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                              {item.tags.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{item.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Footer de acciones */}
                          <div className="mt-2 pt-2 border-t flex items-center gap-2">
                            {whatsappLink && (
                              <Button
                                type="button"
                                size="sm"
                                className="flex-1 text-xs md:text-sm"
                                onClick={() => {
                                  window.open(whatsappLink, "_blank");
                                }}
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Hablar por WhatsApp
                              </Button>
                            )}

                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="shrink-0"
                              onClick={() => handleOpenDetails(item)}
                              title="Ver ficha completa"
                            >
                              <Store className="h-4 w-4" />
                            </Button>

                            {item.instagram && (
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="shrink-0"
                                onClick={() => {
                                  const url = item.instagram?.startsWith("http")
                                    ? item.instagram
                                    : `https://instagram.com/${item.instagram}`;
                                  window.open(url, "_blank");
                                }}
                                title="Ver en Instagram"
                              >
                                <Instagram className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* Mini sección info */}
        <section className="mt-4">
          <Card className="border-dashed bg-muted/40">
            <CardContent className="py-3 px-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  El Marketplace de Jujuy Conecta va a crecer con la comunidad.
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  La idea es sumar sistema de reseñas, mapa interactivo,
                  perfiles de emprendedores y campañas especiales por fecha,
                  para que comprar local sea la primera opción.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Dialog de detalle */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            className="
              w-[95vw]
              sm:w-full
              sm:max-w-lg
              max-h-[90vh]
              overflow-y-auto
            "
          >
            {selectedItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    {selectedItem.name}
                  </DialogTitle>
                  <DialogDescription className="space-y-1">
                    <div className="flex flex-wrap gap-2 items-center text-xs md:text-sm">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        {formatTypeLabel(selectedItem.type)}
                      </Badge>
                      {selectedItem.category && (
                        <Badge variant="secondary">
                          {selectedItem.category}
                        </Badge>
                      )}
                      {selectedItem.municipality && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {selectedItem.municipality}
                        </span>
                      )}
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Imagen o placeholder en el diálogo */}
                  <div className="relative h-52 w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                    {selectedItem.image_url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedItem.image_url}
                          alt={selectedItem.name}
                          className="h-full w-full object-cover"
                        />
                        {selectedItem.has_delivery && (
                          <Badge className="absolute right-2 bottom-2 flex items-center gap-1 bg-background/80 backdrop-blur">
                            <Truck className="h-3 w-3" />
                            Envío disponible
                          </Badge>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground opacity-70">
                        <Store className="h-6 w-6" />
                        <span className="text-sm">Sin imagen disponible</span>
                      </div>
                    )}
                  </div>

                  {selectedItem.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Dirección</p>
                        <p className="text-muted-foreground">
                          {selectedItem.address}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {(selectedItem.phone || selectedItem.whatsapp) && (
                      <div className="flex items-start gap-2 text-sm">
                        <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Contacto</p>
                          {selectedItem.phone && (
                            <p className="text-muted-foreground">
                              {selectedItem.phone}
                            </p>
                          )}
                          {selectedItem.whatsapp && (
                            <p className="text-muted-foreground">
                              WhatsApp: {selectedItem.whatsapp}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {(selectedItem.instagram || selectedItem.website) && (
                      <div className="flex flex-col gap-1 text-sm">
                        {selectedItem.instagram && (
                          <button
                            type="button"
                            onClick={() => {
                              const url =
                                selectedItem.instagram?.startsWith("http")
                                  ? selectedItem.instagram
                                  : `https://instagram.com/${selectedItem.instagram}`;
                              window.open(url, "_blank");
                            }}
                            className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                          >
                            <Instagram className="h-4 w-4" />
                            Ver en Instagram
                          </button>
                        )}
                        {selectedItem.website && (
                          <button
                            type="button"
                            onClick={() => {
                              const url = selectedItem.website?.startsWith(
                                "http"
                              )
                                ? selectedItem.website
                                : `https://${selectedItem.website}`;
                              window.open(url, "_blank");
                            }}
                            className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                          >
                            <Globe className="h-4 w-4" />
                            Ver sitio web
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* {selectedItem.tags && selectedItem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedItem.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[11px] font-normal"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )} */}

                  <div className="pt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    {buildWhatsAppLink(
                      selectedItem.whatsapp ?? selectedItem.phone,
                      selectedItem.name
                    ) && (
                      <Button
                        type="button"
                        onClick={() => {
                          const link = buildWhatsAppLink(
                            selectedItem.whatsapp ?? selectedItem.phone,
                            selectedItem.name
                          );
                          if (link) window.open(link, "_blank");
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Escribir por WhatsApp
                      </Button>
                    )}
                    {/* <Button
                      type="button"
                      variant="outline"
                      className="flex-1 sm:flex-none"
                      onClick={() => {
                        const link = buildEditRequestWhatsApp(selectedItem);
                        window.open(link, "_blank");
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Actualizar datos de esta ficha
                    </Button> */}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog alta de emprendimiento */}
        <NewBusinessDialog
          open={newDialogOpen}
          onOpenChange={setNewDialogOpen}
        />

      </div>
    </Layout>
  );
}
