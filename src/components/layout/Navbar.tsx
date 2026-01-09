import { useState, useRef, useEffect } from "react";
import { Search, Menu, X, Bell, ArrowRight, ExternalLink, ChevronDown } from "lucide-react";
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

// --- TIPOS Y DATA ---
type NavItem = { label: string; href: string };
type SearchItemType = "seccion" | "servicio" | "externo";
interface SearchItem {
  label: string;
  href: string;
  type: SearchItemType;
  keywords: string[];
}

const SEARCH_ITEMS: SearchItem[] = [
    { label: "Inicio", href: "/", type: "seccion", keywords: ["inicio", "home"] },
    { label: "Diario Digital", href: "https://diario.jujuyconecta.com", type: "externo", keywords: ["noticias", "diario"] },
    { label: "Turismo", href: "/turismo", type: "seccion", keywords: ["viaje", "mapa"] },
    { label: "Transporte Público", href: "/transport", type: "seccion", keywords: ["colectivo", "bondi"] },
    { label: "Marketplace Local", href: "/servicios/marketplace", type: "servicio", keywords: ["ventas", "compras"] },
    { label: "Alertas de Seguridad", href: "/security", type: "servicio", keywords: ["estafas", "seguridad"] },
    { label: "Recursos Sociales", href: "/resources", type: "servicio", keywords: ["ayuda", "ong"] },
    { label: "Bolsa de trabajo local", href: "/jobs", type: "servicio", keywords: ["empleo", "trabajo"] },
    { label: "Cosquin Rock", href: "/cosquin-rock-2026", type: "servicio", keywords: ["festival", "musica"] },
];

const servicesByTab: Record<string, { label: string; href: string }[]> = {
  Plataforma: [
    { label: "Portal de Noticias", href: "https://diario.jujuyconecta.com" },
  ],
  "Servicios Públicos": [
    { label: "Transporte y Mapas", href: "/transport" },
    { label: "Bolsa de trabajo local", href: "/jobs" },
    { label: "Recursos Sociales", href: "/resources" },
  ],
  Turismo: [
    { label: "Mapa Turístico", href: "/turismo" },
    { label: "Hoteles", href: "/turismo?tab=hotels" },
    { label: "Conocé Cosquin Rock", href: "/cosquin-rock-2026" },
  ],
  Emprendimientos: [{ label: "Marketplace Local", href: "/servicios/marketplace" }],
  Formación: [
    { label: "Alertas de Seguridad", href: "/security" },
    { label: "Cursos y Talleres", href: "/servicios/cursos" },
  ],
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const servicesRef = useRef<HTMLDivElement | null>(null);
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    const results = SEARCH_ITEMS.filter(item => 
      item.label.toLowerCase().includes(q) || item.keywords.some(k => k.includes(q))
    );
    if (!results.length) {
      toast({ title: "Sin resultados", variant: "destructive" });
      return;
    }
    setSearchResults(results);
    setIsSearchResultsOpen(true);
    setIsMenuOpen(false);
  };

  const navbarBg = isHomePage 
    ? (isScrolled ? "bg-slate-950/95 backdrop-blur-md border-b border-white/10" : "bg-transparent border-transparent") 
    : "bg-slate-950 border-b border-white/10";

  // Componente de Lista de Servicios (Reutilizable)
  const ServiceList = ({ onItemClick }: { onItemClick: () => void }) => (
    <div className="space-y-6">
      {Object.entries(servicesByTab).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <h3 className="px-4 text-[15px] font-bold text-primary uppercase tracking-[0.2em]">
            {category}
          </h3>
          <div className="space-y-1">
            {items.map((item) => {
              const isExternal = item.href.startsWith("http");
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target={isExternal ? "_blank" : "_self"}
                  rel={isExternal ? "noopener noreferrer" : ""}
                  onClick={(e) => {
                    if (!isExternal) {
                      e.preventDefault();
                      navigate(item.href);
                    }
                    onItemClick();
                  }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 group transition-colors"
                >
                  <span className="text-medium font-medium text-slate-200 group-hover:text-white">
                    {item.label}
                  </span>
                  {isExternal ? (
                    <ExternalLink className="h-3 w-3 text-slate-500" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-primary transition-colors translate-x-[-4px] group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                  )}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${navbarBg} ${isScrolled ? 'h-16' : 'h-20'}`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img src="/images/jc.png" alt="Logo" className="h-10 w-10 transition-transform group-hover:scale-110" />
            <span className="hidden sm:block text-lg lg:text-xl font-black text-white uppercase italic">
              JUJUY <span className="text-primary">CONECTA</span>
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-sm">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar servicios, transporte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-full py-2 pl-10 pr-4 focus:outline-none focus:bg-white/10 transition-all placeholder:text-slate-500"
              />
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {["Inicio", "Transporte", "Turismo"].map((label) => (
              <Link
                key={label}
                to={label === "Inicio" ? "/" : `/${label.toLowerCase()}`}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}

            {/* Dropdown Lista Desktop */}
            <div className="relative" ref={servicesRef}>
              <button
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  isServicesOpen ? "text-primary bg-white/10" : "text-slate-300 hover:text-white"
                }`}
              >
                Servicios <ChevronDown className={`h-4 w-4 transition-transform ${isServicesOpen ? "rotate-180" : ""}`} />
              </button>

              {isServicesOpen && (
                <div className="absolute right-0 mt-4 w-72 max-h-[70vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 no-scrollbar animate-in fade-in zoom-in duration-200">
                  <ServiceList onItemClick={() => setIsServicesOpen(false)} />
                </div>
              )}
            </div>

            <div className="h-6 w-[1px] bg-white/10 mx-2" />
            <AuthButton />
          </div>

          <Button variant="ghost" size="icon" className="md:hidden text-white" onClick={() => setIsMenuOpen(true)}>
            <Menu />
          </Button>
        </div>
      </nav>

      {/* MOBILE MENU: LISTA ÚNICA */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-[85%] bg-slate-950 border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="flex items-center justify-between p-6">
              <span className="font-black text-white italic">JUJUY <span className="text-primary">CONECTA</span></span>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="text-white">
                <X />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-8 no-scrollbar">
              <div className="px-4 mb-6">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input 
                    placeholder="¿Qué buscas?" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl pl-10 h-11 text-white"
                  />
                </form>
              </div>

              {/* Lista Unificada Mobile */}
              <ServiceList onItemClick={() => setIsMenuOpen(false)} />
            </div>

            <div className="p-6 border-t border-white/5 bg-slate-900/50 space-y-4">
              <AuthButton />
              <div className="flex justify-center"><InstallAppMenuItem /></div>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG RESULTADOS */}
      <Dialog open={isSearchResultsOpen} onOpenChange={setIsSearchResultsOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white rounded-3xl">
          <DialogHeader><DialogTitle>Resultados</DialogTitle></DialogHeader>
          <div className="space-y-1 max-h-[50vh] overflow-y-auto no-scrollbar">
            {searchResults.map((r) => (
              <div 
                key={r.href} 
                onClick={() => { navigate(r.href); setIsSearchResultsOpen(false); }}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-bold text-sm text-white">{r.label}</div>
                  <div className="text-[10px] text-primary font-bold uppercase">{r.type}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {!isHomePage && <div className="h-20 w-full bg-slate-950" />}
    </>
  );
}