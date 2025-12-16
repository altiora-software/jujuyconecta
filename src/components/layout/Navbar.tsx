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

// Helper de analytics simple para GA4 (gtag)
function trackEvent(action: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (!w.gtag) return;
  w.gtag("event", action, params || {});
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
    { label: "Transporte", href: "/transport" },
    { label: "Turismo", href: "/turismo" },
    { label: "Diario Digital", href: "https://diario.jujuyconecta.com" },
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
    Turismo: [
      { label: "Mapa Turístico", href: "/turismo" },
      { label: "Rutas y Recorridos", href: "/turismo?rutas=true" },
      { label: "Eventos Turísticos", href: "/turismo?tab=events" },
      { label: "Conocé Cosquin Rock", href: "/cosquin-rock-2026" },
    ],
    "Servicios Públicos": [
      { label: "Recursos Sociales ", href: "/resources" },
      { label: "Transporte y Mapas", href: "/transport" },
      { label: "Bolsa de trabajo local", href: "/jobs" },
    ],
  };

  // Índice de búsqueda global
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
    {
      label: "Cosquin Rock",
      href: "cosquin-rock-2026",
      type: "servicio",
      keywords: [
        "cosquin rock",
        "musica",
        "bandas importantes",
        "festival",
        "festivales",
      ],
    },
  ];

  const searchItems = SEARCH_ITEMS;

  const runSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const tokens = q.split(/\s+/).filter(Boolean);

    const scored = searchItems
      .map((item) => {
        const haystack = (
          item.label +
          " " +
          item.keywords.join(" ")
        ).toLowerCase();

        let score = 0;
        for (const t of tokens) {
          if (haystack.includes(t)) {
            score += 2;
          }
        }

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
    trackEvent("search_result_click", {
      label: item.label,
      href: item.href,
      type: item.type,
      context: "modal",
    });

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

    trackEvent("search_submit", {
      query: q,
      results_count: results.length,
      location: "navbar",
    });

    if (!results.length) {
      toast({
        title: "Sin resultados",
        description:
          "No encontramos nada relacionado a esa búsqueda. Probá con otra palabra clave.",
        variant: "destructive",
      });

      trackEvent("search_no_results", {
        query: q,
        location: "navbar",
      });

      return;
    }

    if (results.length === 1) {
      trackEvent("search_direct_navigation", {
        query: q,
        label: results[0].label,
        href: results[0].href,
        type: results[0].type,
      });

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

    trackEvent("search_results_modal_open", {
      query: q,
      results_count: results.length,
    });

    toast({
      title: "Resultados de búsqueda",
      description: `Encontramos ${results.length} resultado(s) relacionado(s).`,
    });
  };

  const handleNotificationClick = async () => {
    trackEvent("navbar_notifications_click", {
      permission_state: permission,
    });

    if (permission === "default") {
      const result = await requestPermission();
      trackEvent("notifications_permission_request_result", {
        result,
      });

      if (result === "granted") {
        sendTestNotification();
        toast({
          title: "¡Notificaciones activadas!",
          description: "Ahora podés recibir alertas personalizadas.",
        });

        trackEvent("notifications_permission_granted", {
          source: "navbar_button",
        });
      }
    } else if (permission === "granted") {
      trackEvent("notifications_center_open", {
        source: "navbar_button",
      });
      navigate("/notifications");
    } else {
      toast({
        title: "Notificaciones deshabilitadas",
        description:
          "Activá las notificaciones en la configuración del navegador.",
        variant: "destructive",
      });

      trackEvent("notifications_blocked_warning_shown", {
        source: "navbar_button",
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
        if (isServicesOpen) {
          trackEvent("navbar_services_close", {
            context: "desktop",
          });
        }
        setIsServicesOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [isServicesOpen]);

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
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2"
              onClick={() =>
                trackEvent("navbar_logo_click", {
                  href: "/",
                })
              }
            > 
            <img src="/images/jc-navidad.png" alt="Jujuy Conecta" className="h-12 w-12" />
            <div className="flex flex-col leading-tight">
              <span className="text-lg lg:text-2xl font-bold text-primary">
                Jujuy Conecta
              </span>
            </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar transporte, turismo, empleos, seguridad..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    trackEvent("search_input_change", {
                      location: "navbar_desktop",
                    });
                  }}
                  className="pl-10 bg-muted/40 border-0 focus:bg-background transition"
                />
              </form>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() =>
                    trackEvent("navbar_nav_click", {
                      label: item.label,
                      href: item.href,
                      context: "desktop",
                    })
                  }
                >
                  <Button
                    size="sm"
                    className={`rounded-full px-4 py-1 text-sm transition ${
                      location.pathname === item.href
                        ? "bg-primary text-white shadow-sm"
                        : "bg-muted/40 text-foreground hover:bg-muted"
                    }`}
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
                  className={`
                    flex items-center gap-1 rounded-full px-3 py-1 text-sm
                    border transition
                    ${
                      isServicesOpen
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-muted/30 border-muted hover:bg-muted"
                    }
                  `}
                  onClick={() => {
                    const next = !isServicesOpen;
                    setIsServicesOpen(next);
                    trackEvent(
                      next
                        ? "navbar_services_open"
                        : "navbar_services_close",
                      {
                        context: "desktop",
                      }
                    );
                  }}
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
                    className="absolute right-0 mt-2 w-80 rounded-lg border bg-card shadow-xl p-4 z-50"
                  >
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.keys(servicesByTab).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => {
                            setActiveServiceTab(tab);
                            trackEvent("navbar_services_tab_change", {
                              tab,
                              context: "desktop",
                            });
                          }}
                          className={`
                            px-3 py-1 rounded-full text-xs font-medium transition border
                            ${
                              activeServiceTab === tab
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-muted/30 text-foreground border-transparent hover:bg-muted"
                            }
                          `}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* Lista de servicios */}
                    <div className="space-y-2">
                      {servicesByTab[activeServiceTab].map((s) => (
                        <Link
                          key={s.href}
                          to={s.href}
                          onClick={() => {
                            setIsServicesOpen(false);
                            trackEvent("navbar_service_click", {
                              label: s.label,
                              href: s.href,
                              tab: activeServiceTab,
                              context: "desktop",
                            });
                          }}
                        >
                          <div className="p-2 rounded-lg border hover:bg-muted/50 transition cursor-pointer">
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
                        onClick={() => {
                          setIsServicesOpen(false);
                          trackEvent("navbar_services_all_click", {
                            context: "desktop",
                          });
                        }}
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
                className="ml-1 relative"
                onClick={handleNotificationClick}
              >
                <Bell className="h-4 w-4" />
                {permission === "default" && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-white">
                    !
                  </Badge>
                )}
                {permission === "granted" && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-secondary">
                    ✓
                  </Badge>
                )}
              </Button>

              <InstallAppMenuItem />
              <AuthButton />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => {
                const next = !isMenuOpen;
                setIsMenuOpen(next);
                trackEvent(
                  next
                    ? "navbar_mobile_menu_open"
                    : "navbar_mobile_menu_close",
                  {}
                );
              }}
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar en Jujuy Conecta..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      trackEvent("search_input_change", {
                        location: "navbar_mobile",
                      });
                    }}
                    className="pl-10 bg-muted/40"
                  />
                </form>

                {/* Mobile Navigation */}
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => {
                        setIsMenuOpen(false);
                        trackEvent("navbar_nav_click", {
                          label: item.label,
                          href: item.href,
                          context: "mobile",
                        });
                      }}
                    >
                      <Button
                        className={`
                          w-full justify-start rounded-full text-sm
                          ${
                            location.pathname === item.href
                              ? "bg-primary text-white shadow-sm"
                              : "bg-muted/40 text-foreground hover:bg-muted"
                          }
                        `}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}

                  {/* Mobile Services Accordion */}
                  <div className="w-full">
                    <Button
                      variant="ghost"
                      className="w-full justify-between rounded-full border bg-muted/30"
                      onClick={() => {
                        const next = !mobileServicesOpen;
                        setMobileServicesOpen(next);
                        trackEvent(
                          next
                            ? "navbar_services_open"
                            : "navbar_services_close",
                          { context: "mobile" }
                        );
                      }}
                    >
                      <span>Servicios</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          mobileServicesOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </Button>

                    {mobileServicesOpen && (
                      <div className="mt-3 space-y-3 px-1">
                        {/* Tabs mobile */}
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(servicesByTab).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => {
                                setActiveServiceTab(tab);
                                trackEvent("navbar_services_tab_change", {
                                  tab,
                                  context: "mobile",
                                });
                              }}
                              className={`
                                px-3 py-1 rounded-full text-xs font-medium transition border
                                ${
                                  activeServiceTab === tab
                                    ? "bg-primary text-white border-primary shadow-sm"
                                    : "bg-muted/30 text-foreground border-transparent hover:bg-muted"
                                }
                              `}
                              aria-pressed={activeServiceTab === tab}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {/* Items mobile */}
                        <div className="space-y-2">
                          {servicesByTab[activeServiceTab].map((s) => (
                            <Link
                              key={s.href}
                              to={s.href}
                              onClick={() => {
                                setIsMenuOpen(false);
                                setMobileServicesOpen(false);
                                trackEvent("navbar_service_click", {
                                  label: s.label,
                                  href: s.href,
                                  tab: activeServiceTab,
                                  context: "mobile",
                                });
                              }}
                              className="block w-full"
                            >
                              <div className="p-3 w-full rounded-lg border bg-card hover:bg-muted/40 transition">
                                <div className="text-sm font-semibold truncate">
                                  {s.label}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  Ir a {s.label}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <InstallAppMenuItem />
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
        onOpenChange={(open) => {
          setIsSearchResultsOpen(open);
          if (!open) {
            trackEvent("search_results_modal_close", {});
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resultados de búsqueda</DialogTitle>
            <DialogDescription className="text-xs">
              Elegí a dónde querés ir. Podés volver a buscar desde la barra
              superior cuando quieras.
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
                    <p className="text-sm font-medium truncate">{r.label}</p>
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
