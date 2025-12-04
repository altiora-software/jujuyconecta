import CosquinGrilla from "@/components/cosquin/CosquinLineup";
import { Layout } from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const EVENT_TIMESTAMP = new Date("2026-02-14T15:00:00-03:00").getTime();

function getTimeLeft(): TimeLeft {
  const now = Date.now();
  const diff = Math.max(EVENT_TIMESTAMP - now, 0);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

// Podés reemplazar estos datos con la grilla real cuando la quieras cargar.
const highlightedArtistsDay1 = [
  "Artistas nacionales e internacionales",
  "Escenas indie y alternativas",
  "Bandas históricas del rock argentino",
];

const highlightedArtistsDay2 = [
  "Propuestas emergentes del NOA",
  "Sets electrónicos y DJ",
  "Artistas sorpresa por anunciar",
];

const CosquinRock2026 = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>

    <div className="min-h-screen bg-[#050814] text-white">
      {/* HERO */}
      <section
        className="relative h-[80vh] min-h-[520px] w-full overflow-hidden"
        aria-labelledby="cosquin-hero-title"
        >
        {/* Fondo: usá una foto propia o de banco libre, NO el arte oficial */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
              backgroundImage:
              "url('https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1600')",
            }}
            />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />

        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 md:flex-row md:items-end md:justify-between md:px-6 lg:px-8">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-orange-300 mb-4">
                Cobertura especial · Jujuy Conecta
              </p>
              <h1
                id="cosquin-hero-title"
                className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl"
                >
                Cosquín Rock 2026,  
                <span className="block text-orange-400">
                  la previa se vive en Jujuy.
                </span>
              </h1>
              <p className="mt-4 text-sm md:text-base text-gray-200 max-w-lg">
                Toda la información clave para viajar desde Jujuy,
                seguir la grilla, descubrir artistas y no perderte nada
                del festival más grande del país.
              </p>

              {/* Countdown */}
              <div className="mt-6 inline-flex flex-wrap items-center gap-4 rounded-2xl bg-black/50 px-4 py-3 backdrop-blur">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-300">
                  Falta cada vez menos
                </span>
                <div className="flex items-center gap-3 text-center">
                  {[
                      { label: "Días", value: timeLeft.days },
                      { label: "Hs", value: timeLeft.hours },
                      { label: "Min", value: timeLeft.minutes },
                      { label: "Seg", value: timeLeft.seconds },
                    ].map((item) => (
                        <div key={item.label} className="px-2">
                      <div className="text-2xl font-bold tabular-nums">
                        {item.value.toString().padStart(2, "0")}
                      </div>
                      <div className="text-[0.65rem] uppercase tracking-widest text-gray-400">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://diario.jujuyconecta.com/cosquin-rock-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide hover:bg-orange-400 transition"
                  >
                  Ver cobertura en el Diario
                </a>
                <button
                  onClick={() => {
                      const el = document.getElementById("cosquin-grilla");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"
                    >
                  Ver info y grilla destacada
                </button>
              </div>
            </div>

            <div className="mt-8 w-full max-w-xs md:mt-0">
              <div className="rounded-3xl bg-black/65 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400 mb-2">
                  Datos del festival
                </p>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-400">Fechas</dt>
                    <dd className="font-semibold">14 y 15 de febrero 2026</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Lugar</dt>
                    <dd className="font-semibold">
                      Aeródromo Santa María de Punilla, Córdoba, Argentina
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Modalidad</dt>
                    <dd className="font-semibold">
                      Festival de música · múltiples escenarios · camping y
                      experiencias.
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-[0.7rem] text-gray-400 leading-relaxed">
                  Esta página es una producción periodística independiente de
                  Jujuy Conecta para difundir información del evento para la
                  audiencia del NOA. No es el sitio oficial del festival.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-14 md:px-6 lg:px-8">
        {/* Sección: Introducción / Contexto */}
        <section className="grid gap-8 md:grid-cols-[3fr,2fr]">
          <div>
            <h2 className="text-2xl font-bold mb-3">
              La experiencia Cosquín Rock vista desde Jujuy
            </h2>
            <p className="text-sm md:text-base text-gray-200 leading-relaxed">
              Cada verano, miles de personas viajan desde el norte del país para
              vivir dos días de música, calor y montaña. En esta edición 2026,
              desde Jujuy Conecta centralizamos la información clave para la
              comunidad jujeña: cómo viajar, qué tener en cuenta, dónde alojarse
              y qué propuestas artísticas no podés perderte.
            </p>
            <p className="mt-3 text-sm md:text-base text-gray-300">
              Nuestra cobertura está pensada para que puedas seguir la previa,
              el minuto a minuto y el post festival, tanto si viajás al
              aeródromo como si lo vivís desde casa.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl bg-white/5 p-4 text-sm text-gray-100">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">
              Qué vas a encontrar acá
            </h3>
            <ul className="space-y-1.5">
              <li>• Resumen de la propuesta artística por día.</li>
              <li>• Tips para viajar desde Jujuy y el NOA.</li>
              <li>• Recomendaciones de seguridad y cuidados.</li>
              <li>• Enlaces a la cobertura en tiempo real del Diario.</li>
            </ul>
            <p className="text-[0.7rem] text-gray-400">
              La programación, horarios y condiciones pueden modificarse por
              decisión de la producción del festival, te recomendamos verificar
              siempre la información oficial.
            </p>
          </div>
        </section>

        <CosquinGrilla/>

        {/* Sección: Viaje desde Jujuy */}
        <section className="space-y-8">
            <h2 className="text-3xl font-black tracking-tight text-white">
                La Ruta al Cosquín Rock: cómo llegar desde Jujuy
            </h2>

            <p className="text-base text-gray-300 max-w-3xl">
                Para miles de jujeños el viaje ya es parte del ritual. Ruta larga, amigos,
                parlantes, calor y esa sensación de que estás yendo al lugar donde todo
                explota. Estas son las formas más comunes de bajar al valle para vivir el
                festival desde adentro.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-black/40 p-5 border border-white/10 hover:border-orange-400/40 transition">
                <h3 className="text-lg font-bold uppercase mb-3 text-orange-300">
                    Colectivo
                </h3>
                <p className="text-gray-200 leading-relaxed">
                    La opción más popular para quienes van en banda. Salidas desde Jujuy
                    con trasbordo en Salta/Tucumán o directos a Córdoba. Desde la terminal
                    tenés traslados al aeródromo. Es viaje largo, pero termina siendo parte
                    de la experiencia.
                </p>
                </div>

                <div className="rounded-2xl bg-black/40 p-5 border border-white/10 hover:border-orange-400/40 transition">
                <h3 className="text-lg font-bold uppercase mb-3 text-orange-300">
                    Auto
                </h3>
                <p className="text-gray-200 leading-relaxed">
                    Ruta, mate, playlist y el sol pegando en la cordillera. Podés bajar por
                    Salta–Tucumán o cruzar por Salinas. Controlá peajes y revisá todo antes
                    de salir: frenos, agua, luces. En Cosquín no querés quedarte tirado.
                </p>
                </div>

                <div className="rounded-2xl bg-black/40 p-5 border border-white/10 hover:border-orange-400/40 transition">
                <h3 className="text-lg font-bold uppercase mb-3 text-orange-300">
                    Avión + Traslado
                </h3>
                <p className="text-gray-200 leading-relaxed">
                    Para los que quieren llegar frescos. Vuelos a Córdoba capital y desde
                    ahí traslados al predio. Rápido, cómodo y sin ruta, pero con la adrenalina
                    intacta cuando pisás Punilla.
                </p>
                </div>
            </div>
            </section>


        {/* Sección: Cobertura de Jujuy Conecta */}
        <section className="space-y-8">
            <h2 className="text-3xl font-black tracking-tight text-white">
                Cobertura Jujuy Conecta · El Cosquín visto desde el Norte
            </h2>

            <p className="text-base text-gray-300 max-w-3xl">
                Vamos a contar el festival como lo vivimos nosotros: desde la fila,
                desde el pogo, desde el pastito al atardecer, desde la gente que viaja
                mil kilómetros para ver a su banda. Contenido crudo, real y cercano.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-black/40 p-5 border border-white/10 hover:border-orange-400/40 transition">
                <h3 className="text-lg font-bold uppercase mb-3 text-orange-300">
                    Crónicas en vivo
                </h3>
                <p className="text-gray-200 leading-relaxed">
                    Lo que pasa arriba y abajo del escenario. Texto, emociones, momentos y
                    esa vibra que solo Cosquín tiene. Crónicas para leer con auriculares
                    puestos.
                </p>
                </div>

                <div className="rounded-2xl bg-black/40 p-5 border border-white/10 hover:border-orange-400/40 transition">
                <h3 className="text-lg font-bold uppercase mb-3 text-orange-300">
                    Cámara en mano
                </h3>
                <p className="text-gray-200 leading-relaxed">
                    Pablo capturando el caos hermoso del festival: público, detalles,
                    escenarios, colores, caras, luces. Clips que se sienten y fotos que
                    explican todo sin decir nada.
                </p>
                </div>

                <div className="rounded-2xl bg-black/40 p-5 border border-white/10 hover:border-orange-400/40 transition">
                <h3 className="text-lg font-bold uppercase mb-3 text-orange-300">
                    Guía para jujeños
                </h3>
                <p className="text-gray-200 leading-relaxed">
                    Consejos reales para quienes viajan desde el Norte: clima, horarios,
                    puntos clave, hidratación, accesos, dónde encontrarte con la tribu
                    jujeña dentro del predio.
                </p>
                </div>
            </div>
        </section>


        {/* Mapa */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Ubicación del festival</h2>
            <a
              href="https://maps.app.goo.gl/5EngGhNGGsL4s1RCA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400 hover:text-orange-300"
              >
              Abrir en Google Maps ↗
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <iframe
              title="Mapa Cosquín Rock 2026"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4044.576240819121!2d-64.4560639!3d-31.284454899999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x942d7bfb5e944355%3A0x71c7e2a8989edd10!2sAeroclub%20Santa%20Mar%C3%ADa%20de%20Punilla!5e1!3m2!1ses-419!2sar!4v1764863432208!5m2!1ses-419!2sar"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-72 w-full border-0"
              />
          </div>
        </section>

        {/* Disclaimer legal */}
        <section className="border-t border-white/10 pt-6">
          <p className="text-[0.7rem] text-gray-400 leading-relaxed">
            Cosquín Rock es una marca registrada de sus respectivos titulares.
            Jujuy Conecta no organiza el evento ni vende entradas, solamente
            brinda información y cobertura periodística dirigida a la comunidad
            del NOA. Para comprar tickets, condiciones de ingreso y
            actualizaciones oficiales, consultá siempre los canales oficiales
            del festival.
          </p>
        </section>
      </main>
    </div>
    </Layout>
  );
};

export default CosquinRock2026;
