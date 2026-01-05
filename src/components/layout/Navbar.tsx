import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { AuthButton } from "@/components/auth/AuthButton";

type NavItem = { label: string; href: string };

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const servicesRef = useRef<HTMLDivElement | null>(null);

  // 1. EFECTO DE SCROLL: Cambia el estado cuando el usuario baja más de 20px.
  // Esto permite que la Navbar pase de transparente a sólida.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. LÓGICA DE FONDO (Corrección de visibilidad):
  // Si es Home y no hay scroll -> Transparente.
  // En cualquier otro caso (Otras páginas o Scroll) -> Fondo oscuro sólido (slate-950).
  const navbarBg = isHomePage 
    ? (isScrolled ? "bg-slate-950/95 backdrop-blur-md border-b border-white/10" : "bg-transparent border-transparent") 
    : "bg-slate-950 border-b border-white/10";

  // 3. ITEMS DE NAVEGACIÓN:
  // Importante: El Diario Digital usa URL completa para activar la lógica de enlace externo.
  const navItems: NavItem[] = [
    { label: "Inicio", href: "/" },
    { label: "Transporte", href: "/transport" },
    { label: "Turismo", href: "/turismo" },
    { label: "Diario Digital", href: "https://diario.jujuyconecta.com" },
  ];

  // 4. CIERRE DE DROPDOWNS: Cierra el menú de servicios si se hace clic fuera de él.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setIsServicesOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // 5. HELPER DE RENDERIZADO: Esta función decide si usa <Link> (interno) o <a> (externo/pestaña nueva).
  const renderNavLink = (item: NavItem, isMobile: boolean) => {
    const isExternal = item.href.startsWith("http");
    const baseStyles = isMobile 
      ? `flex items-center px-4 py-4 rounded-2xl text-lg font-bold transition-all ${
          location.pathname === item.href ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`
      : `rounded-full px-4 font-medium transition-colors hover:bg-white/10 ${
          location.pathname === item.href ? "text-primary bg-white/5" : "text-white"
        }`;

    if (isExternal) {
      return (
        <a
          key={item.href}
          href={item.href}
          target="_blank"        // Abre en nueva pestaña
          rel="noopener noreferrer" // Seguridad para enlaces externos
          onClick={() => setIsMenuOpen(false)}
          className={baseStyles}
        >
          {item.label}
        </a>
      );
    }

    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={() => setIsMenuOpen(false)}
        className={baseStyles}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${navbarBg} ${isScrolled ? 'h-16' : 'h-20'}`}>
        <div className="container mx-auto px-4 h-full">
          <div className="flex h-full items-center justify-between gap-3">
            
            {/* LOGO E IDENTIDAD */}
            <Link to="/" className="flex items-center gap-2 group"> 
              <img src="/images/jc.png" alt="Jujuy Conecta" className="h-10 w-10 sm:h-12 sm:w-12 transition-transform group-hover:scale-110" />
              <div className="flex flex-col leading-tight">
                <span className="text-lg lg:text-2xl font-black tracking-tighter text-white uppercase italic">
                  JUJUY <span className="text-primary font-bold">CONECTA</span>
                </span>
              </div>
            </Link>

            {/* NAVEGACIÓN DESKTOP */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => renderNavLink(item, false))}
              
              <div className="h-6 w-[1px] bg-white/20 mx-2" />
              <AuthButton />
            </div>

            {/* BOTÓN MENÚ MÓVIL (Hamburguesa/Cerrar) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/10 z-[110]" // Z-index alto para estar sobre el panel
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </Button>
          </div>
        </div>
      </nav>

      {/* PANEL DE MENÚ MÓVIL */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* 6. OVERLAY: Fondo desenfocado que cierra el menú al tocarlo */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* 7. CONTENEDOR DEL PANEL: Color oscuro para no cansar la vista */}
          <div className="fixed right-0 top-0 h-full w-[80%] max-w-[320px] bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header del Panel con Logo */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                <img src="/images/jc.png" alt="Logo" className="h-8 w-8" />
                <span className="text-white font-black tracking-tighter italic text-sm">
                  JUJUY <span className="text-primary">CONECTA</span>
                </span>
              </div>
              {/* Botón X dentro del panel */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:bg-white/10 rounded-full"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Enlaces del Menú Móvil */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-4 mb-2 tracking-widest">Navegación</span>
                {navItems.map((item) => renderNavLink(item, true))}
              </div>
              
              <div className="h-[1px] bg-white/5 mx-4" />
              
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4">Mi Cuenta</span>
                <div className="px-2">
                  <AuthButton />
                </div>
              </div>
            </div>

            {/* Footer del Menú */}
            <div className="p-8 text-center border-t border-white/5">
              <p className="text-[10px] text-slate-600 font-medium uppercase tracking-tighter">
                Conectando Jujuy © 2026
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 8. ESPACIADOR DINÁMICO:
          En Home, el contenido va detrás de la Navbar (transparente).
          En otras páginas, este div empuja el contenido 80px hacia abajo para que la Navbar sólida no lo tape. */}
      {!isHomePage && <div className="h-20 w-full bg-slate-950" />}
    </>
  );
}