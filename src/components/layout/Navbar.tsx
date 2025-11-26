import { useState, useRef, useEffect } from "react";
import { Search, Menu, X, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { AuthButton } from "@/components/auth/AuthButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InstallAppMenuItem } from "../pwa/InstallAppMenuItem";

type NavItem = { label: string; href: string };

type SearchItemType = "seccion" | "servicio" | "externo";

interface SearchItem {
  label: string;
  href: string;
  type: SearchItemType;
  keywords: string[];
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState("Plataforma");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { permission, requestPermission, sendTestNotification } =
    useNotifications();
  const { toast } = useToast();
  const servicesRef = useRef<HTMLDivElement | null>(null);

  const navItems: NavItem[] = [
    { label: "Inicio", href: "/" },
    { label: "Diario Digital", href: "https://diario.jujuyconecta.com" },
    { label: "Turismo", href: "/turismo" },
    { label: "Transporte", href: "/transport" },
  ];  

  const servicesByTab: Record<string, { label: string; href: string }[]> = {
    Plataforma: [
      { label: "Portal de Noticias", href: "https://diario.jujuyconecta.com" },
      { label: "Agenda Comunitaria", href: "/servicios/agenda" },
    ],
    Emprendimientos: [
      { label: "Marketplace Local", href: "/servicios/marketplace" },
      // { label: "Asesoría de Negocios", href: "/servicios/asesoria-startup" },
    ],
    Formación: [
      { label: "Alertas de Seguridad", href: "/security" },
      { label: "Cursos y Talleres", href: "/servicios/cursos" },
    ],
    "Turismo": [
    { label: "Mapa Turístico", href: "/turismo" },              // o una subruta tipo /turismo/mapa si la tenés
    { label: "Rutas y Recorridos", href: "/turismo?rutas=true" },
    { label: "Eventos Turísticos", href: "/turismo?tab=events" },
    ],
    "Servicios Públicos": [
      { label: "Recursos Sociales ", href: "/resources" },
      { label: "Transporte y Mapas", href: "/transport" },
      { label: "Bolsa de trabajo local", href: "/jobs" },
    ],
  };

  // Índice de búsqueda global, mezclando navegación + servicios + keywords
  const SEARCH_ITEMS: SearchItem[] = [
    // Navegación principal
    {
      label: "Inicio",
      href: "/",
      type: "seccion",
      keywords: ["inicio", "home", "principal", "jujuy conecta"],
    },
    {
      label: "Diario Digital",
      href: "https://diario.jujuyconecta.com",
      type: "seccion",
      keywords: [
        "diario",
        "noticias",
        "diario digital",
        "actualidad",
        "información",
        "jujuy conecta diario",
      ],
    },
    {
      label: "Turismo",
      href: "/turismo",
      type: "seccion",
      keywords: [
        "turismo",
        "viaje",
        "viajes",
        "cerros",
        "quebrada",
        "puna",
        "yungas",
        "lugares turísticos",
        "mapa turístico",
        "rutas turísticas",
      ],
    },
    {
      label: "Transporte Público",
      href: "/transport",
      type: "seccion",
      keywords: [
        "transporte",
        "colectivo",
        "colectivos",
        "bondi",
        "bondis",
        "paradas",
        "recorridos",
        "líneas",
        "mapa colectivos",
      ],
    },

    // Servicios
    {
      label: "Portal de Noticias",
      href: "https://diario.jujuyconecta.com",
      type: "servicio",
      keywords: ["noticias", "diario", "portal", "información local"],
    },
    {
      label: "Agenda Comunitaria",
      href: "/servicios/agenda",
      type: "servicio",
      keywords: ["agenda", "eventos", "actividades", "calendario", "comunidad"],
    },
    {
      label: "Marketplace Local",
      href: "/servicios/marketplace",
      type: "servicio",
      keywords: ["marketplace", "ventas", "compras", "productos locales"],
    },
    {
      label: "Asesoría de Negocios",
      href: "/servicios/asesoria-startup",
      type: "servicio",
      keywords: [
        "asesoría",
        "negocios",
        "emprender",
        "emprendimientos",
        "startup",
      ],
    },
    {
      label: "Alertas de Seguridad",
      href: "/security",
      type: "servicio",
      keywords: [
        "seguridad",
        "estafas",
        "phishing",
        "grooming",
        "fraudes",
        "ciberseguridad",
      ],
    },
    {
      label: "Cursos y Talleres",
      href: "/servicios/cursos",
      type: "servicio",
      keywords: ["cursos", "talleres", "formación", "aprender"],
    },
    {
      label: "Recursos Sociales",
      href: "/resources",
      type: "servicio",
      keywords: [
        "recursos sociales",
        "comedores",
        "merenderos",
        "ong",
        "ayuda",
        "asistencia",
      ],
    },
    {
      label: "Transporte y Mapas",
      href: "/transport",
      type: "servicio",
      keywords: [
        "colectivos",
        "paradas",
        "mapa",
        "mapa de transporte",
        "líneas de colectivo",
      ],
    },
    {
      label: "Bolsa de trabajo local",
      href: "/jobs",
      type: "servicio",
      keywords: [
        "empleo",
        "empleos",
        "trabajo",
        "trabajos",
        "bolsa de trabajo",
        "ofertas laborales",
        "laburo",
      ],
    },
  ];

  const searchItems = SEARCH_ITEMS; // si después querés fusionar dinámico, partís de acá

  const runSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // tokens simples por espacios
    const tokens = q.split(/\s+/).filter(Boolean);

    const scored = searchItems
      .map((item) => {
        const haystack = (
          item.label +
          " " +
          item.keywords.join(" ")
        ).toLowerCase();

        // cada token que aparezca suma puntos
        let score = 0;
        for (const t of tokens) {
          if (haystack.includes(t)) {
            score += 2;
          }
        }

        // bonus si el label incluye el query completo
        if (item.label.toLowerCase().includes(q)) {
          score += 3;
        }

        return { item, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map((x) => x.item);
  };

  const goToSearchItem = (item: SearchItem) => {
    if (item.type === "externo" || item.href.startsWith("http")) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    } else {
      navigate(item.href);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    const results = runSearch(q);

    if (!results.length) {
      toast({
        title: "Sin resultados",
        description:
          "No encontramos nada relacionado a esa búsqueda. Probá con otra palabra clave.",
        variant: "destructive",
      });
      return;
    }

    if (results.length === 1) {
      goToSearchItem(results[0]);
      toast({
        title: "Te llevamos a",
        description: results[0].label,
      });
      setSearchQuery("");
      setIsMenuOpen(false);
      return;
    }

    setSearchResults(results.slice(0, 30));
    setIsSearchResultsOpen(true);
    setSearchQuery("");
    setIsMenuOpen(false);

    toast({
      title: "Resultados de búsqueda",
      description: `Encontramos ${results.length} resultado(s) relacionado(s).`,
    });
  };

  const handleNotificationClick = async () => {
    if (permission === "default") {
      const result = await requestPermission();
      if (result === "granted") {
        sendTestNotification();
        toast({
          title: "¡Notificaciones activadas!",
          description: "Ahora podés recibir alertas personalizadas.",
        });
      }
    } else if (permission === "granted") {
      navigate("/notifications");
    } else {
      toast({
        title: "Notificaciones deshabilitadas",
        description:
          "Activá las notificaciones en la configuración del navegador.",
        variant: "destructive",
      });
    }
  };

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(e.target as Node)
      ) {
        setIsServicesOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const getTypeBadge = (type: SearchItemType) => {
    if (type === "seccion") return <Badge variant="outline">Sección</Badge>;
    if (type === "servicio")
      return <Badge variant="secondary">Servicio</Badge>;
    return <Badge variant="default">Externo</Badge>;
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-sm">JC</span>
              </div>
              <span className="text-xl font-bold text-primary">
                Jujuy Conecta
              </span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar transporte, turismo, empleos, seguridad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-0 focus:bg-background transition-smooth"
                />
              </form>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={
                      location.pathname === item.href ? "default" : "ghost"
                    }
                    size="sm"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}

              {/* Services dropdown */}
              <div className="relative" ref={servicesRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => setIsServicesOpen((s) => !s)}
                  aria-expanded={isServicesOpen}
                  aria-controls="services-dropdown"
                >
                  <span>Servicios</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isServicesOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </Button>

                {isServicesOpen && (
                  <div
                    id="services-dropdown"
                    className="absolute right-0 mt-2 w-105 rounded-lg border bg-background p-4 shadow-lg"
                  >
                    {/* Tabs */}
                    <div className="flex gap-1 mb-3">
                      {Object.keys(servicesByTab).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveServiceTab(tab)}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                            activeServiceTab === tab
                              ? "bg-primary text-white"
                              : "bg-muted/30"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* Lista de servicios de la tab activa */}
                    <div className="grid grid-cols-1 gap-2">
                      {servicesByTab[activeServiceTab].map((s) => (
                        <Link
                          key={s.href}
                          to={s.href}
                          onClick={() => setIsServicesOpen(false)}
                        >
                          <div className="p-2 rounded hover:bg-primary/10 transition cursor-pointer">
                            <div className="text-sm font-semibold">
                              {s.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Ir a {s.label}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Link
                        to="/servicios"
                        onClick={() => setIsServicesOpen(false)}
                      >
                        <Button size="sm" variant="outline">
                          Ver todos los servicios
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Notificaciones */}
              <Button
                variant="outline"
                size="sm"
                className="ml-2 relative"
                onClick={handleNotificationClick}
              >
                <Bell className="h-4 w-4" />
                {permission === "default" && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary">
                    !
                  </Badge>
                )}
                {permission === "granted" && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-secondary">
                    ✓
                  </Badge>
                )}
              </Button>

              <AuthButton />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t bg-card/95 backdrop-blur">
              <div className="px-4 py-4 space-y-3">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar en Jujuy Conecta..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </form>

                {/* Mobile Navigation */}
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button
                        variant={
                          location.pathname === item.href
                            ? "default"
                            : "ghost"
                        }
                        className="w-full justify-start"
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}

                  <div className="w-full box-border overflow-hidden">
                    <Button
                      variant="ghost"
                      className="w-full justify-between"
                      onClick={() =>
                        setMobileServicesOpen((s) => !s)
                      }
                    >
                      <span>Servicios</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          mobileServicesOpen
                            ? "rotate-180"
                            : "rotate-0"
                        }`}
                      />
                    </Button>

                    {mobileServicesOpen && (
                      <div className="mt-2 space-y-2 px-2 max-w-full overflow-hidden">
                        <div className="flex flex-wrap gap-2 pb-1">
                          {Object.keys(servicesByTab).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setActiveServiceTab(tab)}
                              className={`px-3 py-1 rounded-md text-sm font-medium min-w-0 truncate ${
                                activeServiceTab === tab
                                  ? "bg-primary text-white"
                                  : "bg-muted/20"
                              }`}
                              aria-pressed={activeServiceTab === tab}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-2">
                          {servicesByTab[activeServiceTab].map(
                            (s) => (
                              <Link
                                key={s.href}
                                to={s.href}
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  setMobileServicesOpen(false);
                                }}
                                className="block w-full"
                              >
                                <div className="p-2 w-full box-border rounded hover:bg-muted/40 transition cursor-pointer">
                                  <div className="text-sm font-semibold truncate">
                                    {s.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    Ir a {s.label}
                                  </div>
                                </div>
                              </Link>
                            ),
                          )}
                        </div>

                        <div className="flex justify-end">
                          <Link
                            to="/servicios"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Button size="sm" variant="outline">
                              Ver todos
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <AuthButton />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Modal de resultados de búsqueda */}
      <Dialog
        open={isSearchResultsOpen}
        onOpenChange={setIsSearchResultsOpen}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resultados de búsqueda</DialogTitle>
            <DialogDescription className="text-xs">
              Elegí a dónde querés ir. Podés volver a buscar desde la
              barra superior cuando quieras.
            </DialogDescription>
          </DialogHeader>

          {searchResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay resultados para esta búsqueda.
            </p>
          ) : (
            <div className="space-y-2">
              {searchResults.map((r) => (
                <div
                  key={`${r.href}-${r.label}`}
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 hover:bg-muted/70 cursor-pointer"
                  onClick={() => {
                    setIsSearchResultsOpen(false);
                    goToSearchItem(r);
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {r.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.keywords.slice(0, 4).join(" • ")}
                    </p>
                  </div>
                  {getTypeBadge(r.type)}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
