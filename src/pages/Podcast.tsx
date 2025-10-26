// src/pages/PodcastPage.tsx
import { Layout } from "@/components/layout/Layout";
import { useState, useEffect, useMemo } from "react";
// UI primitives (ya los usabas)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Info, Youtube, Mic, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jujuconectapodcast from '@/assets/jujuyconectapodcast2.png'
import bannerPodcast from '@/assets/bannerPodcast.png'
import { ComingSoonModal } from "@/components/comming/ComingSoonModal";

type Episode = {
  id: string;
  title: string;
  date: string;
  duration: string;
  description?: string;
  audioURL?: string;
  tags?: string[];
  coverURL?: string;
  Hosted?: string;
  guests?: string[];
};

const YOUTUBE_CHANNEL = "https://youtube.com/@jujuyconecta"; // reemplazá por tu canal real

export default function Podcast() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [playerEpisode, setPlayerEpisode] = useState<Episode | null>(null);
  const [activeTab, setActiveTab] = useState<"episodios" | "recursos" | "about">("episodios");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [modalOpen, setModalOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);

      // MOCK: si querés reemplazá por fetch real (Supabase / API)
      const host = "";
      const demo: Episode[] = [
        {
          id: "ep-001",
          title: "Episodio 1 — Presentación: Jujuy Conecta",
          date: "2025-10-22",
          duration: "35:12",
          description:
            "Arrancamos el videopodcast: quiénes somos, qué vamos a hacer y por qué la tecnología y la cultura local importan. Hablamos con invitados y repasamos proyectos locales.",
          audioURL: host ? `${host}/media/episodio1.mp3` : "/media/episodio1.mp3",
          tags: ["presentación", "tecno", "comunidad"],
          coverURL: "/media/ep1.jpg",
          Hosted: "Ale",
          guests: ["Pablo"]
        },
        {
          id: "ep-002",
          title: "Episodio 2 — Emprendimientos en altura",
          date: "2025-10-29",
          duration: "42:05",
          description:
            "Historias de emprendedores jujeños que usan la tecnología para escalar negocios en zonas de altura. Tips, errores y aprendizajes.",
          audioURL: host ? `${host}/media/episodio2.mp3` : "/media/episodio2.mp3",
          tags: ["emprendimiento", "economía"],
          coverURL: "/media/ep2.jpg",
          Hosted: "Ale",
          guests: ["Lucía Gómez"]
        },
        {
          id: "ep-003",
          title: "Episodio 3 — Tecnología y tradición",
          date: "2025-11-05",
          duration: "38:20",
          description:
            "Conversamos sobre cómo la tecnología puede potenciar oficios y tradiciones locales sin perder identidad. Casos de éxito y herramientas prácticas.",
          audioURL: host ? `${host}/media/episodio3.mp3` : "/media/episodio3.mp3",
          tags: ["cultura", "tecnología"],
          coverURL: "/media/ep3.jpg",
          Hosted: "Pablo",
          guests: ["Martín Ruiz"]
        },
      ];

      if (mounted) {
        // ordeno con el primer episodio (más nuevo) al principio
        setEpisodes(demo);
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return episodes;
    return episodes.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description ?? "").toLowerCase().includes(q) ||
        (e.tags ?? []).join(" ").toLowerCase().includes(q) ||
        (e.Hosted ?? "").toLowerCase().includes(q)
    );
  }, [search, episodes]);

  // Featured: el primer episodio (el que estaría primero)
  const featured = episodes.length ? episodes[0] : null;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-64 animate-pulse" />
            <div className="h-4 bg-muted rounded w-96 animate-pulse" />
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-44 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">Jujuy Conecta — Video Podcast</h1>
            <p className="text-muted-foreground max-w-2xl">
              La voz digital del Norte argentino: tecnología, emprendimiento, cultura y comunidad. Estamos grabando — pronto
              vas a escuchar los primeros episodios.
            </p>
          </div>

          {/* YouTube / Suscripción CTA */}
          <div className="flex items-center gap-3">
            <a
              href={YOUTUBE_CHANNEL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-white font-semibold shadow hover:brightness-95 transition"
              aria-label="Ir al canal de YouTube de Jujuy Conecta"
            >
              <Youtube className="w-5 h-5" />
              Canal YouTube
            </a>

            <Button
              size="sm"
              onClick={() =>
                toast({
                  title: "Suscribite",
                  description: "Buscanos en Spotify, Apple Podcasts o agregá nuestro RSS a tu lector.",
                })
              }
            >
              Suscribite
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="episodios">Episodios</TabsTrigger>
            <TabsTrigger value="recursos">Recursos</TabsTrigger>
            <TabsTrigger value="about">Sobre</TabsTrigger>
          </TabsList>

          {/* EPISODIOS */}
          <TabsContent value="episodios" className="space-y-5">
            {/* Featured / Próximo episodio */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Featured card (ocupa columna 1-2 en desktop) */}
              <div className="lg:col-span-2">
                <Card className="shadow-2xl">
                  <div className="relative w-full h-56 md:h-72 lg:h-80 overflow-hidden rounded-t-xl">
                    <img
                      src={bannerPodcast}
                      alt={featured ? featured.title : "Próximo Episodio - Jujuy Conecta"}
                      className="w-full h-full object-cover"
                    />
                    {/* Badge "Próximo" */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-green-700">Próximo</Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs text-slate-500">{featured ? featured.date : "Grabando"}</div>
                        <h3 className="text-xl md:text-2xl font-bold mt-2">
                          {featured ? featured.title : "Episodio 1 — Aquí estará la presentación del videopodcast"}
                        </h3>

                        <p className="mt-3 text-sm text-slate-700 max-w-3xl">
                          {featured
                            ? featured.description
                            : "Estamos grabando el primer episodio. Aquí aparecerá la miniatura, el audio y la descripción. Mientras tanto podés suscribirte y seguirnos en YouTube para no perderte el estreno."}
                        </p>

                        <div className="mt-4 flex gap-2 flex-wrap">
                        <Button size="sm" onClick={() => setModalOpen(true)}>
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
                          </svg>
                          Reproducir
                        </Button>

                          <a
                            href={YOUTUBE_CHANNEL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 text-sm font-semibold hover:shadow-md"
                          >
                            Ver canal (YouTube)
                          </a>
                        </div>
                      </div>

                      {/* Mini panel con metadata y suscripción + social */}
                      <aside className="hidden lg:flex lg:flex-col gap-3 w-56 shrink-0">
                        <div className="bg-white rounded-xl p-3 border shadow">
                          <div className="text-xs text-slate-500">Duración</div>
                          <div className="font-medium mt-1">{featured ? featured.duration : "—"}</div>
                        </div>

                        <div className="bg-white rounded-xl p-3 border shadow">
                          <div className="text-xs text-slate-500">Host</div>
                          <div className="font-medium mt-1">{ "Ale & Pablo"}</div>
                        </div>
                      </aside>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* YouTube / placeholder video box */}
              <div className="lg:col-span-1">
                <Card className="h-full flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Youtube className="w-5 h-5 text-red-600" /> Canal de YouTube
                    </CardTitle>
                    <CardDescription>Suscribite para ver el estreno del primer episodio y clips detrás de cámaras.</CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 flex-1">
                    {/* Placeholder: si querés podés inyectar iframe con video real */}
                    <div className="w-full h-44 bg-black/5 rounded overflow-hidden flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-sm font-semibold">Próximo estreno</div>
                        <div className="text-xs text-slate-500 mt-1">Miniatura del primer episodio aquí</div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <a
                        href={YOUTUBE_CHANNEL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-600 text-white font-semibold shadow"
                      >
                        Ir al canal
                      </a>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toast({
                            title: "YouTube",
                            description: "Copiá el enlace y pegalo en tu navegador para suscribirte.",
                          })
                        }
                      >
                        ¿Cómo suscribirme?
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* GRID DE EPISODIOS (tarjetas) */}
            {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay episodios que coincidan con la búsqueda</p>
                  </CardContent>
                </Card>
              ) : (
                filtered.map((ep, idx) => (
                  <Card key={ep.id} className={`hover:shadow-2xl transition-shadow flex flex-col ${idx === 0 ? "ring-2 ring-green-100" : ""}`}>
                    <div className="relative w-full h-44 overflow-hidden rounded-t">
                      <img src={ep.coverURL ?? "/jujuyconectapodcast2.png"} alt={ep.title} className="w-full h-full object-cover" />
                    </div>

                    <CardHeader className="pb-2 pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-base">{ep.title}</CardTitle>
                          <CardDescription className="text-xs">{ep.date} · {ep.duration}</CardDescription>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">{ep.Hosted}</div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="mt-0 flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground line-clamp-3">{ep.description}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {(ep.tags ?? []).map((t) => (
                          <Badge key={t} className="text-xs">#{t}</Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button size="sm" onClick={() => setPlayerEpisode(ep)}>
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
                          </svg>
                          Reproducir
                        </Button>

                        <Button size="sm" variant="outline" onClick={() => setSelectedEpisode(ep)}>
                          <Info className="h-4 w-4 mr-2" />
                          Ver detalles
                        </Button>
                      </div>

                      <a href={ep.audioURL ?? "#"} className="text-xs text-muted-foreground mt-3 inline-block hover:underline" rel="noreferrer">
                        Descargar
                      </a>
                    </CardContent>
                  </Card>
                ))
              )}
            </div> */}

            {/* Reproductor fijo */}
            <Card className="mt-4">
              <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Reproductor</div>
                  <div className="font-medium">{playerEpisode ? playerEpisode.title : "Seleccioná un episodio"}</div>
                  <div className="text-xs text-muted-foreground">{playerEpisode ? playerEpisode.Hosted : ""}</div>
                </div>

                <div>
                  <audio controls src={playerEpisode?.audioURL ?? undefined} className="w-64 md:w-96" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RECURSOS */}
          <TabsContent value="recursos">
            <Card>
              <CardHeader>
                <CardTitle>Recursos mencionados</CardTitle>
                <CardDescription>Enlaces, proyectos y contactos citados en los episodios.</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">Huichaira Vineyards</div>
                      <div className="text-xs text-muted-foreground">Proyecto vitivinícola en altura — episodio 2</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a className="text-sm hover:underline text-primary" href="#" target="_blank" rel="noreferrer">Ir al recurso</a>
                    </div>
                  </li>
                  <li className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">Programa Impulso Emprendedor — Jujuy</div>
                      <div className="text-xs text-muted-foreground">Apoyos, becas y capacitaciones locales</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a className="text-sm hover:underline text-primary" href="#" target="_blank" rel="noreferrer">Ir al recurso</a>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABOUT */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Sobre el videopodcast</CardTitle>
                <CardDescription>Propósito, hosts y cómo participar.</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">¿Qué buscamos?</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Conectar a la comunidad jujeña con historias sobre tecnología, emprendimiento y cultura. Invitamos a
                      quienes crean e innovan en la región a compartir su voz.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Cómo participar</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Enviá preguntas, sugerencias de invitados o historias al mail <strong>hola@jujuyconecta.ar</strong> o por
                      Instagram <strong>@jujuyconecta</strong>.
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h4 className="font-semibold">Hosts</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Alejandro</strong> — Hosted. <br />
                    <strong>Pablo</strong> — Productor.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* DIALOG: episodio detalles */}
        <Dialog open={!!selectedEpisode} onOpenChange={() => setSelectedEpisode(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedEpisode ? selectedEpisode.title : "Episodio"}</DialogTitle>
            </DialogHeader>

            {selectedEpisode && (
              <div className="space-y-4">
                <div className="w-full h-56 overflow-hidden rounded">
                  <img src={selectedEpisode.coverURL ?? "/jujuyconectapodcast2.png"} alt={selectedEpisode.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Hosted: <strong>{selectedEpisode.Hosted}</strong></p>
                    {selectedEpisode.guests && selectedEpisode.guests.length > 0 && (
                      <p className="text-sm text-muted-foreground">Invitados: {selectedEpisode.guests.join(", ")}</p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{selectedEpisode?.duration}</div>
                </div>

                <p className="text-sm text-muted-foreground">{selectedEpisode.description}</p>

                <div>
                  <h4 className="text-sm font-semibold">Tags</h4>
                  <div className="mt-2 flex gap-2">
                    {(selectedEpisode.tags ?? []).map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <audio controls src={selectedEpisode.audioURL} className="w-full" />
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full" onClick={() => selectedEpisode?.audioURL && window.open(selectedEpisode.audioURL, "_blank")}>
                    Abrir audio en nueva pestaña
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <ComingSoonModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </Layout>
  );
}



// ...



