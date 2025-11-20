import { useState, useRef, useEffect } from "react";
import { Search, Menu, X, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { AuthButton } from "@/components/auth/AuthButton";

type NavItem = { label: string; href: string };

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false); // desktop services dropdown
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false); // mobile accordion
  const [activeServiceTab, setActiveServiceTab] = useState("Plataforma");
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { permission, requestPermission, sendTestNotification } = useNotifications();
  const { toast } = useToast();
  const servicesRef = useRef<HTMLDivElement | null>(null);

  const navItems: NavItem[] = [
    { label: "Inicio", href: "/" },
    { label: "Diario Digital", href: "https://jujuyconecta.online" },
    { label: "Turismo", href: "/turismo" },
    { label: "Transporte", href: "/transport" },
  ];

  // Ejemplo de servicios organizados en solapas
  const servicesByTab: Record<string, { label: string; href: string }[]> = {
    Plataforma: [
      { label: "Portal de Noticias", href: "/diario" },
      // { label: "Portal de Noticias", href: "/servicios/portal-noticias" },
      { label: "Agenda Comunitaria", href: "/servicios/agenda" },
      { label: "Directorio Local", href: "/servicios/directorio" },
    ],
    "Emprendimientos": [
      { label: "Marketplace Local", href: "/servicios/marketplace" },
      { label: "Asesoría de Negocios", href: "/servicios/asesoria-startup" },
    ],
    "Formación": [
      { label: "Alertas de Seguridad", href: "/security" },
      { label: "Cursos y Talleres", href: "/servicios/cursos" },
      { label: "Mentorías", href: "/servicios/mentorias" },
    ],
    "Servicios Públicos": [
      { label: "Recursos Sociales ", href: "/resources" },
      { label: "Transporte y Mapas", href: "/transport" },
      { label: "Bolsa de trabajo local", href: "/jobs" },
    ],
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Búsqueda realizada",
        description: `Buscando: "${searchQuery}"`,
      });
      // implementar búsqueda real si corresponde
      setSearchQuery("");
    }
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
        description: "Activá las notificaciones en la configuración del navegador.",
        variant: "destructive",
      });
    }
  };

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setIsServicesOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-sm">JC</span>
            </div>
            <span className="text-xl font-bold text-primary">Jujuy Conecta</span>
          </Link>

          {/* Desktop Search (opcional) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar en Jujuy Conecta..."
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
                  variant={location.pathname === item.href ? "default" : "ghost"}
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
                <ChevronDown className={`h-4 w-4 transition-transform ${isServicesOpen ? "rotate-180" : "rotate-0"}`} />
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
                          activeServiceTab === tab ? "bg-primary text-white" : "bg-muted/30"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Lista de servicios de la tab activa */}
                  <div className="grid grid-cols-1 gap-2">
                    {servicesByTab[activeServiceTab].map((s) => (
                      <Link key={s.href} to={s.href} onClick={() => setIsServicesOpen(false)}>
                        <div className="p-2 rounded hover:bg-primary transition cursor-pointer">
                          <div className="text-sm font-semibold">{s.label}</div>
                          <div className="text-xs text-muted-foreground">Ir a {s.label}</div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pequeña acción/CTA */}
                  <div className="mt-3 flex justify-end">
                    <Link to="/servicios" onClick={() => setIsServicesOpen(false)}>
                      <Button size="sm" variant="outline">Ver todos los servicios</Button>
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
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                  <Link key={item.href} to={item.href} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={location.pathname === item.href ? "default" : "ghost"}
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
                    onClick={() => setMobileServicesOpen((s) => !s)}
                  >
                    <span>Servicios</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${mobileServicesOpen ? "rotate-180" : "rotate-0"}`}
                    />
                  </Button>

                  {mobileServicesOpen && (
                    <div className="mt-2 space-y-2 px-2 max-w-full overflow-hidden">
                      {/* Tabs como selects en mobile: permiten wrap en varias líneas */}
                      <div className="flex flex-wrap gap-2 pb-1">
                        {Object.keys(servicesByTab).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveServiceTab(tab)}
                            className={`px-3 py-1 rounded-md text-sm font-medium min-w-0 truncate ${
                              activeServiceTab === tab ? "bg-primary text-white" : "bg-muted/20"
                            }`}
                            aria-pressed={activeServiceTab === tab}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        {servicesByTab[activeServiceTab].map((s) => (
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
                              <div className="text-sm font-semibold truncate">{s.label}</div>
                              <div className="text-xs text-muted-foreground truncate">Ir a {s.label}</div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <Link to="/servicios" onClick={() => setIsMenuOpen(false)}>
                          <Button size="sm" variant="outline">Ver todos</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
