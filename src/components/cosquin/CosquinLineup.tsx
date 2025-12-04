import React from "react";
import clsx from "clsx";

const baseArtists = [
  "1915","ABEL PINTOS","AINDA","AIRBAG","AMIGO DE ARTISTAS","ARKADYAN","BABASONICOS",
  "BANDALOS CHINOS","BEATS MODERNOS","BERSUIT VERGARABAT","BLAIR","BRIGADO CREW","BRUZ",
  "BULLDOZER BLUES BAND","CALIGARIS","CARAS EXTRAÑAS","CHECHI DE MARCOS","CIRO Y LOS PERSAS",
  "CORDELIA’S BLUES","COTI","CRUZANDO EL CHARCO","CRYSTAL THOMAS & LUCA GIORDANO","CTM",
  "CUARTETO DE NOS","DAVID ELLEFSON","DEER JADE","DEVENDRA BANHART (SOLO)","DILLOM","DIVIDIDOS",
  "DORIAN","DUM CHICA","EL CLUB DE LA SERPIENTE","EL KUELGUE","EL PLAN DE LA MARIPOSA","EL ZAR",
  "EMI","ERUCA SATIVA","ESTELARES","FANTASMAGORIA","FITO PAEZ","FRANKY WAH","FRANZ FERDINAND",
  "GAUCHITO CLUB","GAUCHOS OF THE PAMPA","GIRL ULTRA","GISA LONDERO & TOYO BAGOSO","GLAUCO DI MAMBRO",
  "GOLO´S BAND & ANASTASIA AMARANTE","GRASS HOPPER’S","GUASONES","GUSTAVO CORDERA","HERMANOS GUTIERREZ",
  "INDIOS","JOVENES PORDIOSEROS","KAPANGA","KILL FLORA","KÖLSCH","LA FRANELA","LA MISSISSIPPI",
  "LA VELA PUERCA","LABIOS DE SAL","LALI","LAS PASTILLAS DEL ABUELO","LAS PELOTAS","LAS WITCHES",
  "LE DRACS","LEHAR","LES DIABOLETTES","LOS ESPIRITUS","LOS MENTIDORES","LOS PERICOS","LOURDES LOURDES",
  "LOUTA","MALANDRO","MARIANO MELLINO","MARILINA BERTOLDI","MARKY RAMONE","MATTHIAS TANZMANN",
  "MICROTUL","MISTY SOUL CHOIR","MORAT","NINA PORTELA","NIÑO MONJA","PABLO FIERRO","PAPPO X JUANSE",
  "PECES RAROS","PERRO SUIZO","PITI FERNANDEZ","RENZO LEALI","ROSY GOMEEZ","RUDY","RYAN","SANTIAGO GARCIA",
  "SILVESTRE Y LA NARANJA","SIX SEX","SOFI MORA","T&K","TANGO & ROLL","THE CHEMICAL BROTHERS DJ SET",
  "TRUENO","TURF","UN MUERTO MAS","VALENTIN HUEDO","VICTORIA WHYNOT","VIEJAS LOCAS X FACHI Y ABEL",
  "WANDA JAEL","WAYRA IGLESIAS","XIME MONZON","YSY A","AGARRATE CATALINA"
];

const artistsDay1 = [
  "1915","AMIGO DE ARTISTAS","ABEL PINTOS","ARKADYAN","BABASONICOS","BERSUIT VERGARABAT","BRIGADO CREW",
  "BRUZ","CALIGARIS","CHECHI DE MARCOS","CIRO Y LOS PERSAS","CRUZANDO EL CHARCO","CUARTETO DE NOS",
  "DILLOM","EL KUELGUE","EL ZAR","EMI","ERUCA SATIVA","ESTELARES","FANTASMAGORIA","FRANZ FERDINAND",
  "GIRL ULTRA","HERMANOS GUTIERREZ","INDIOS","JOVENES PORDIOSEROS","KILL FLORA","LA FRANELA","LA MISSISSIPPI",
  "LA VELA PUERCA","LALI","LAS PELOTAS","LAS WITCHES","LE DRACS","LEHAR","LES DIABOLETTES","LOS ESPIRITUS",
  "LOS MENTIDORES","LOUTA","MARILINA BERTOLDI","MICROTUL","MISTY SOUL CHOIR","NIÑO MONJA","PABLO FIERRO",
  "PERRO SUIZO","PITI FERNANDEZ","RYAN","SANTIAGO GARCIA","TANGO & ROLL","THE CHEMICAL BROTHERS DJ SET",
  "TURF","UN MUERTO MÁS","VALENTIN HUEDO","VICTORIA WHYNOT","VIEJAS LOCAS X FACHI Y ABEL","WAYRA IGLESIAS"
];

const artistsDay2 = [
  "AGARRATE CATALINA","AINDA","AIRBAG","BANDALOS CHINOS","BEATS MODERNOS","BLAIR","BULLDOZER BLUES BAND",
  "CARAS EXTRAÑAS","CORDELIA’S BLUES","COTI","CRYSTAL THOMAS & LUCA GIORDANO","CTM","DAVID ELLEFSON",
  "DEER JADE","DEVENDRA BANHART (SOLO)","DIVIDIDOS","DORIAN","DUM CHICA","EL CLUB DE LA SERPIENTE",
  "EL PLAN DE LA MARIPOSA","FITO PAEZ","FRANKY WAH","GAUCHITO CLUB","GAUCHOS OF THE PAMPA",
  "GISA LONDERO & TOYO BAGOSO","GLAUCO DI MAMBRO","GOLO´S BAND & ANASTASIA AMARANTE","GRASSHOPPER’S",
  "GUASONES","GUSTAVO CORDERA","KAPANGA","KÖLSCH","LABIOS DE SAL","LAS PASTILLAS DEL ABUELO","LOS PERICOS",
  "LOURDES LOURDES","MALANDRO","MARIANO MELLINO","MARKY RAMONE","MATTHIAS TANZMANN","MORAT","NINA PORTELA",
  "PAPPO X JUANSE","PECES RAROS","RENZO LEALI","ROSY GOMEEZ","RUDY","SILVESTRE Y LA NARANJA","SIX SEX",
  "SOFI MORA","T&K","TRUENO","WANDA JAEL","XIME MONZON","YSY A"
];

// Headliners / bandas destacadas
const HEADLINERS = new Set<string>([
  "BABASONICOS",
  "CIRO Y LOS PERSAS",
  "DIVIDIDOS",
  "FITO PAEZ",
  "FRANZ FERDINAND",
  "LALI",
  "LAS PASTILLAS DEL ABUELO",
  "LAS PELOTAS",
  "AIRBAG",
  "CUARTETO DE NOS",
  "THE CHEMICAL BROTHERS DJ SET",
  "TRUENO",
  "YSY A",
  "MORAT",
  "DILLOM",
]);

const randomColor = () => {
  const colors = [
    "text-[#ff9bd3]", // rosa
    "text-[#ffe066]", // amarillo
    "text-[#7dd3fc]", // celeste
    "text-[#c4f372]", // verde lima
    "text-[#fbbf77]", // naranja suave
    "text-[#b9a6ff]", // lila
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

type ArtistProps = {
  name: string;
};

const Artist: React.FC<ArtistProps> = ({ name }) => {
  const isHeadliner = HEADLINERS.has(name);

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 cursor-default select-none transition-all duration-150",
        isHeadliner
          ? "px-2 py-1 rounded-md bg-black/40 hover:bg-black/70 hover:scale-110"
          : "px-1 py-0.5 hover:scale-110",
      )}
    >
      <span
        className={clsx(
          "whitespace-nowrap",
          isHeadliner
            ? "text-base sm:text-lg md:text-xl font-black uppercase tracking-wide bg-gradient-to-tr from-orange-300 via-yellow-200 to-pink-300 bg-clip-text text-transparent drop-shadow"
            : "text-xs sm:text-sm font-semibold",
          !isHeadliner && randomColor(),
        )}
      >
        {name}
      </span>
      {isHeadliner && (
        <span className="text-[0.55rem] sm:text-[0.6rem] font-black uppercase tracking-[0.15em] bg-orange-400 text-black px-2 py-0.5 rounded-full shadow-md">
          Destacado
        </span>
      )}
    </span>
  );
};

export default function CosquinGrilla() {
  return (
    <section
      id="cosquin-grilla"
      className="relative mt-10 space-y-10 overflow-hidden rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-[#071538] via-[#050517] to-[#020008] px-4 py-8 md:px-8 md:py-10"
    >
      {/* Textura tipo papel / ruido */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 1px, transparent 0)",
          backgroundSize: "4px 4px",
        }}
      />

      {/* Manchas cartoon (ilustraciones abstractas) */}
      <div className="pointer-events-none absolute -top-16 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-pink-500 via-orange-400 to-yellow-300 opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-cyan-300 opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute top-6 right-6 h-16 w-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-yellow-300 opacity-80 flex items-center justify-center text-2xl rotate-6">
        <span className="drop-shadow-lg">🎧</span>
      </div>

      <div className="relative space-y-10">
        {/* Título */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-300 mb-1">
              Especial Jujuy Conecta
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow">
              Grilla artística Cosquín Rock 2026
            </h2>
            <p className="text-sm text-gray-200 max-w-xl mt-2">
              Todos los nombres que pisan el escenario en Santa María de
              Punilla. Hacé hover sobre las bandas para darles zoom y fijate
              quiénes vienen como <span className="font-semibold text-orange-300">DESTACADOS</span>.
            </p>
          </div>

          <a
            href="https://cosquinrock.net"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-orange-400/60 px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-orange-300 hover:bg-orange-400 hover:text-black transition"
          >
            Sitio oficial ↗
          </a>
        </div>

        {/* GLOBALES */}
        <div className="rounded-3xl bg-[#0c1b4a]/80 border border-white/15 px-4 py-6 sm:px-6 sm:py-7 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          <p className="text-center text-xs sm:text-sm text-blue-100 mb-3 font-semibold tracking-[0.18em] uppercase">
            Aeródromo Santa María de Punilla · 14 y 15 de febrero
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {baseArtists.map((a) => (
              <Artist key={a} name={a} />
            ))}
          </div>
        </div>

        {/* POR DÍA */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Día 1 */}
          <div className="rounded-3xl bg-[#0c1b4a]/80 border border-white/15 px-4 py-6 sm:px-6 sm:py-7 shadow-[0_18px_50px_rgba(0,0,0,0.65)]">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-blue-100">
                Día 1
              </span>
              <span className="text-xs font-semibold text-orange-300 uppercase tracking-[0.25em]">
                14 de febrero
              </span>
            </div>
            <p className="text-[0.8rem] text-gray-200 mb-3">
              Clásicos, pogo asegurado y varias bombas internacionales. Ideal
              para arrancar el festival con todo.
            </p>
            <div className="flex flex-wrap gap-2">
              {artistsDay1.map((a) => (
                <Artist key={a} name={a} />
              ))}
            </div>
          </div>

          {/* Día 2 */}
          <div className="rounded-3xl bg-[#0c1b4a]/80 border border-white/15 px-4 py-6 sm:px-6 sm:py-7 shadow-[0_18px_50px_rgba(0,0,0,0.65)]">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-blue-100">
                Día 2
              </span>
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-[0.25em]">
                15 de febrero
              </span>
            </div>
            <p className="text-[0.8rem] text-gray-200 mb-3">
              Mezcla de rock, electrónica, propuestas nuevas y varios shows
              para cerrar el fin de semana bien arriba.
            </p>
            <div className="flex flex-wrap gap-2">
              {artistsDay2.map((a) => (
                <Artist key={a} name={a} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
