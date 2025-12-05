const ticketsCosquin = [
  {
    id: "abono-general",
    title: "Abono General",
    image: "/cosquin/cosquin-abono-general.webp",
    description:
      "Acceso a ambos días del festival, todos los escenarios y áreas gastronómicas. No incluye sectores FANATIC.",
    url: "https://cosquinrock.net",
    color: "from-orange-500 to-red-600",
  },
  {
    id: "entrada-dia",
    title: "Entrada por Día",
    image: "/cosquin/cosquin-entrada-general.webp",
    description:
      "Elige el día (14 o 15 de febrero). Acceso a shows y áreas gastronómicas del día seleccionado.",
    url: "https://cosquinrock.net",
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "fanatic",
    title: "Fanatic Abono",
    image: "/cosquin/cosquin-fanatic.webp",
    description:
      "Incluye beneficios especiales, accesos diferenciados y vista preferencial según la producción.",
    url: "https://cosquinrock.net",
    color: "from-blue-600 to-indigo-700",
  },
  {
    id: "fanatic-ind",
    title: "Fanatic Individual",
    image: "/cosquin/fanatic-individual.webp",
    description:
      "Entrada FANATIC válida para un solo día. Sectores exclusivos y beneficios especiales.",
    url: "https://cosquinrock.net",
    color: "from-fuchsia-500 to-purple-700",
  },
];

export function CosquinTicketsJC() {
  return (
    <section
      id="cosquin-entradas"
      className="space-y-6 w-full max-w-full overflow-x-hidden"
    >
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
        Entradas oficiales · Cosquín Rock 2026
      </h2>

      <p className="max-w-3xl text-sm sm:text-base text-gray-300">
        Resumen claro de los tipos de ticket disponibles. La compra final se
        realiza siempre mediante los canales oficiales del festival.
      </p>

      {/* GRID RESPONSIVE SIN SCROLL HORIZONTAL */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 w-full">
        {ticketsCosquin.map((t) => (
          <div
            key={t.id}
            className="
              group flex min-h-0 flex-col 
              overflow-hidden rounded-2xl 
              bg-black/40 border border-white/10 backdrop-blur-sm 
              shadow-lg hover:shadow-xl transition
            "
          >
            {/* Imagen con aspecto fijo para que no rompa el layout */}
            <div
              className={`
                relative w-full overflow-hidden 
                aspect-[4/3] bg-gradient-to-br ${t.color}
                flex items-center justify-center
              `}
            >
              <img
                src={t.image}
                alt={t.title}
                className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition"
              />
            </div>

            {/* Contenido */}
            <div className="flex flex-1 flex-col p-4 space-y-3 text-sm">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {t.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {t.description}
              </p>

              <div className="mt-auto pt-3">
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex w-full items-center justify-center 
                    rounded-full bg-orange-600 px-4 py-2 
                    text-xs sm:text-sm font-semibold 
                    uppercase tracking-wider text-white 
                    hover:bg-orange-500 transition
                  "
                >
                  Comprar entradas
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="max-w-3xl text-[0.7rem] sm:text-xs text-gray-400 leading-relaxed">
        Los precios, condiciones de ingreso y políticas de reembolso dependen
        exclusivamente de la producción oficial del festival y sus ticketeras.
        Jujuy Conecta ofrece este módulo solo como guía informativa para la
        comunidad del NOA.
      </p>
    </section>
  );
}
