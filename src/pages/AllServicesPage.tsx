// src/pages/AllServicesPage.tsx
import React, { useMemo, useState } from "react";
import { Search, Grid, Compass, Tag, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

type Service = { label: string; href: string; category?: string; description?: string };

const SERVICES: Record<string, Service[]> = {
  Plataforma: [
    { label: "Portal de Noticias", href: "/servicios/portal-noticias", category: "Plataforma", description: "Noticias locales, reportajes y actualidad de Jujuy." },
    { label: "Agenda Comunitaria", href: "/servicios/agenda", category: "Plataforma", description: "Eventos, ferias y actividades culturales." },
    { label: "Directorio Local", href: "/servicios/directorio", category: "Plataforma", description: "Negocios y servicios de la provincia." },
  ],
  Emprendimientos: [
    { label: "Marketplace Local", href: "/servicios/marketplace", category: "Emprendimientos", description: "Vende y descubre productos de emprendedores jujeños." },
    { label: "Asesoría de Negocios", href: "/servicios/asesoria-startup", category: "Emprendimientos", description: "Mentoría y acompañamiento para proyectos." },
  ],
  Formación: [
    { label: "Alertas de Seguridad", href: "/security", category: "Plataforma", description: "Sistema de avisos y notificaciones urgentes." },
    { label: "Cursos y Talleres", href: "/servicios/cursos", category: "Formación", description: "Capacitación técnica y oficios para la comunidad." },
    { label: "Mentorías", href: "/servicios/mentorias", category: "Formación", description: "Acompañamiento personalizado para emprendedores." },
  ],
  "Servicios Públicos": [
    { label: "Recursos Sociales", href: "/resources", category: "Servicios Públicos", description: "Programas, trámites y ayuda social." },
    { label: "Transporte y Mapas", href: "/transport", category: "Servicios Públicos", description: "Horarios, rutas y mapas interactivos." },
    { label: "Bolsa de trabajo local", href: "/jobs", category: "Servicios Públicos", description: "Ofertas laborales de la región." },
  ],
};

/* ---------- ServiceCard: tarjeta bien estructurada ---------- */
function ServiceCard({ s }: { s: Service }) {
  const initials = s.label
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <article
      role="article"
      aria-label={s.label}
      className="h-full flex flex-col bg-white rounded-2xl border border-slate-100 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 overflow-hidden"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") window.location.href = s.href;
      }}
    >
      {/* contenido principal */}
      <div className="p-4 md:p-5 flex flex-col">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-tr from-green-600 to-green-400 text-white font-bold flex items-center justify-center shadow-sm">
              <span className="text-sm md:text-base">{initials}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-green-800 truncate">{s.label}</h3>
            <p className="mt-2 text-xs md:text-sm text-slate-600 max-h-[4.5rem] overflow-hidden">
              {s.description ?? `Accedé a ${s.label.toLowerCase()} — herramientas y recursos.`}
            </p>
          </div>
        </div>

        {/* meta móvil */}
        <div className="mt-3 md:hidden">
          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
            <Tag className="w-3 h-3" />
            {s.category ?? "General"}
          </span>
        </div>
      </div>

      {/* footer */}
      <div className="border-t border-slate-100 p-4 md:p-5 bg-white/60 flex items-center justify-between gap-3">
        <div className="hidden md:flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
            <Tag className="w-3 h-3" />
            {s.category ?? "General"}
          </span>
          <span className="text-xs text-slate-500">Última actualización: Oct 2025</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={s.href}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-green-600 text-white text-sm font-semibold shadow hover:shadow-lg transition transform hover:-translate-y-0.5"
            aria-label={`Abrir ${s.label}`}
          >
            Abrir
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

/* ---------- Page principal ---------- */
export default function AllServicesPage(): JSX.Element {
  const [q, setQ] = useState("");
  const normalized = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    const out: Record<string, Service[]> = {};
    Object.keys(SERVICES).forEach((cat) => {
      const items = SERVICES[cat].filter(
        (s) =>
          s.label.toLowerCase().includes(normalized) ||
          (s.description ?? "").toLowerCase().includes(normalized) ||
          (s.category ?? "").toLowerCase().includes(normalized)
      );
      if (items.length) out[cat] = items;
    });
    return out;
  }, [normalized]);

  const keys = Object.keys(filtered);
  const hasResults = keys.length > 0;

  return (
    <Layout>
      <main className="min-h-screen py-10 px-4 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white shadow-sm mb-4">
              <Compass className="w-4 h-4" />
              <span className="text-sm font-semibold">Servicios · Jujuy Conecta</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Todos los servicios</h1>
            <p className="mt-2 text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
              Explorá las herramientas y servicios que ponemos a disposición de la comunidad jujeña.
            </p>

            {/* Search */}
            <div className="mt-6 flex justify-center">
              <div className="w-full max-w-xl flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-sm border border-slate-100">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm md:text-base"
                  placeholder="Buscar servicio por nombre, descripción o categoría..."
                  aria-label="Buscar servicios"
                />
                {q ? (
                  <button
                    onClick={() => setQ("")}
                    aria-label="Limpiar búsqueda"
                    className="text-xs text-slate-500 px-2 py-1 rounded-full hover:bg-slate-100 transition"
                  >
                    Limpiar
                  </button>
                ) : null}
              </div>
            </div>
          </header>

          {/* Contenedor centrado */}
          <section aria-labelledby="all-services" className="w-full flex justify-center">
            <div className="w-full max-w-10xl">
              {/* Grid de categorías */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-12">
                {hasResults ? (
                  keys.map((cat) => (
                    <section key={cat} aria-labelledby={`cat-${cat}`} className="bg-white/75 border border-slate-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h2 id={`cat-${cat}`} className="text-lg font-semibold text-green-800 flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green-100 text-green-700">
                            <Grid className="w-4 h-4" />
                          </span>
                          {cat}
                        </h2>
                        <div className="text-xs text-slate-500">{filtered[cat].length} servicios</div>
                      </div>

                      {/* Grid de servicios dentro de la categoría */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered[cat].map((s) => (
                          <ServiceCard key={s.href} s={s} />
                        ))}
                      </div>
                    </section>
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-slate-100 shadow">
                    <p className="text-sm text-slate-600">No se encontraron servicios para tu búsqueda.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
