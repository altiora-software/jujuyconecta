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
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState("Plataforma");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);

  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const navigate = useNavigate();
  const { permission, requestPermission, sendTestNotification } =
    useNotifications();
  const { toast } = useToast();
  const servicesRef = useRef<HTMLDivElement | null>(null);

// ------ manejador de logo dinamica 
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lógica de clases dinámicas
  // Si es el home y no scrolleamos, es transparente. Si scrolleamos o no es el home, es sólida.
  const navbarBg = isHomePage 
    ? (isScrolled ? "bg-card/90 backdrop-blur-md border-b" : "bg-transparent border-transparent") 
    : "bg-card/95 backdrop-blur-md border-b";

  const textColor = isHomePage && !isScrolled ? "text-white" : "text-foreground";
// ------------------- 
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
      { label: "Hoteles", href: "/turismo?tab=hotels" },
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
      <nav 
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${navbarBg} ${isScrolled ? 'h-16' : 'h-20'}`}
      >
        <div className="container mx-auto px-4 h-full">
          <div className="flex h-full items-center justify-between gap-3">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group"> 
              <img src="/images/jc.png" alt="Jujuy Conecta" className="h-10 w-10 sm:h-12 sm:w-12 transition-transform group-hover:scale-110" />
              <div className="flex flex-col leading-tight">
                <span className={`text-lg lg:text-2xl font-black tracking-tighter transition-colors ${isHomePage && !isScrolled ? 'text-white' : 'text-primary'}`}>
                  Jujuy Conecta
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Agregamos el color dinámico */}
            <div className={`hidden md:flex items-center gap-1 ${textColor}`}>
              {navItems.map((item) => (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full px-4 font-medium hover:bg-white/10 ${
                      location.pathname === item.href ? "text-primary" : ""
                    }`}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}

              {/* Services dropdown modificado para el fondo oscuro */}
              <div className="relative" ref={servicesRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 rounded-full px-3 py-1 text-sm hover:bg-white/10"
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                >
                  <span>Servicios</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isServicesOpen ? "rotate-180" : "rotate-0"}`} />
                </Button>
                {/* ... (el resto del dropdown de servicios queda igual) */}
              </div>

              <div className="h-6 w-[1px] bg-white/20 mx-2" /> {/* Separador sutil */}
              
              <AuthButton />
            </div>

            {/* Botón Menu Mobile adaptado */}
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden ${textColor}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Espaciador: Solo aparece si NO estamos en el Home */}
      {!isHomePage && <div className="h-16" />}
    </>
  );
}
