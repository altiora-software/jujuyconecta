import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Newspaper, Heart, Megaphone, Users, Mail } from "lucide-react";

const DIARIO_URL = "/diario"; // Cambiá por dominio real del diario

export default function DiarioPresentacion(): JSX.Element {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <Layout>
      <main className="container mx-auto px-4 py-12">
        {/* HERO */}
        <section className="grid gap-6 md:grid-cols-2 items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Nace <span className="text-primary">Diario Jujuy Conecta</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Un diario digital hecho desde el Norte argentino para el mundo: periodismo local,
              historias de emprendedores, tecnología que transforma y agenda cultural.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={DIARIO_URL}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-black font-medium shadow hover:opacity-95"
              >
                <Newspaper className="w-4 h-4" />
                Ver el diario
              </a>

              <button
                onClick={() => (window.location.href = "/apoyar")}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border hover:bg-muted/10"
              >
                <Megaphone className="w-4 h-4" />
                Cómo apoyar
              </button>
            </div>
          </div>

          <div>
            {/* Card resumen rápido */}
            <Card>
              <CardHeader>
                <CardTitle>¿Qué haremos?</CardTitle>
                <CardDescription>Periodismo con foco local y relevancia regional.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mr-2">1</Badge>
                    <div>
                      Noticias locales verificadas, investigaciones y reportajes en profundidad.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mr-2">2</Badge>
                    <div>Historias de emprendedores, talento regional y economía creativa.</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mr-2">3</Badge>
                    <div>Agenda cultural y acompañamiento a eventos y proyectos comunitarios.</div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-8" />

        {/* POR QUÉ ES IMPORTANTE */}
        <section className="grid gap-6 md:grid-cols-3 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" /> Comunidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Conectamos voces locales con soluciones prácticas: información que ayuda a tomar mejores decisiones
                en lo cotidiano y en los negocios.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Heart className="w-4 h-4" /> Identidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Preservamos tradiciones y promovemos la innovación sin perder la identidad regional. Historias reales que inspiran.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Megaphone className="w-4 h-4" /> Ecosistema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fomentamos alianzas entre emprendedores, instituciones y público: un ecosistema que crece con información de calidad.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-8" />

        {/* COMO PARTICIPAR / APOYAR */}
        <section id="apoyar" className="grid gap-6 md:grid-cols-2 mb-12 items-start">
          {/* <div>
            <h2 className="text-2xl font-semibold">Cómo podés apoyar</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu apoyo fortalece el periodismo local. Buscamos sostenibilidad para mantener calidad editorial y producir más contenido.
            </p>

            <ul className="mt-4 space-y-3 text-sm">
              <li><strong>Compartir:</strong> la forma más sencilla de ayudarnos es compartir nuestras notas y eventos.</li>
              <li><strong>Suscribirte:</strong> suscripciones y newsletters para recibir contenido exclusivo y sin algoritmos.</li>
              <li><strong>Colaborar:</strong> si sos organizador, emprendedor o institución, proponé notas, eventos o patrocinios.</li>
              <li><strong>Donar:</strong> microdonaciones para proyectos especiales y coberturas en terreno.</li>
            </ul>

            <div className="mt-6 flex gap-3">
              <a href={DIARIO_URL} className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-black">
                <Newspaper className="w-4 h-4" /> Ir al diario
              </a>

              <button
                onClick={() => (window.location.href = "/apoyar")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border hover:bg-muted/10"
              >
                <Megaphone className="w-4 h-4" /> Contactar para apoyar
              </button>
            </div>
          </div> */}

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Suscribite al newsletter</CardTitle>
                <CardDescription>Recibí lo más importante cada semana.</CardDescription>
              </CardHeader>
              <CardContent>
                {!subscribed ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      // Aquí podrías integrar con tu backend o servicio de newsletters
                      if (email.trim()) {
                        setSubscribed(true);
                      }
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <div className="mt-2 flex gap-2">
                        <Input value={email} onChange={(ev) => setEmail(ev.target.value)} placeholder="tu@email.com" />
                        <Button type="submit">Suscribirme</Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">No compartimos tu email. Podés darte de baja cuando quieras.</p>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <p className="font-semibold">¡Gracias por suscribirte!</p>
                    <p className="text-sm text-muted-foreground mt-2">Pronto vas a recibir novedades en tu bandeja.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-8" />

        {/* FOOTER CTA + RESPONSABILIDAD */}
        <section className="mt-8">
          <Card>
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Estamos construyendo algo grande</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Si compartís nuestra visión, sumate: leé las noticias en nuestro diario y participá para que el proyecto sea sostenible.
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                {/* <a href={DIARIO_URL} className="inline-flex items-center gap-2 px-5 py-3 rounded bg-primary text-black">
                  <Newspaper className="w-4 h-4" /> Ver diario
                </a> */}

                <a href="/apoyar" className="inline-flex items-center gap-2 px-4 py-3 rounded border">
                  <Heart className="w-4 h-4" /> Cómo apoyar
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </Layout>
  );

  // pequeño placeholder para feedback instantáneo (reemplazá con tu toast)
  function toastPlaceholder() {
    // si tenés hook useToast, podés reemplazar esta implementación
    try {
      // eslint-disable-next-line no-alert
      alert("Gracias por tu interés. Te contactaremos para coordinar formas de apoyo.");
    } catch (e) {
      /* noop */
    }
  }
}
