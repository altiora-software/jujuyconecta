import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Heart, Gift, FileText, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Página: Apoyar / Donar
 * - Reemplazá los placeholders (ENLACE_MERCADOPAGO, ENLACE_PAYPAL, datos bancarios) por los reales.
 * - Si no tenés Input/Textarea componentes, sustituí por <input /> y <textarea /> estándar.
 */

const ENLACE_MERCADOPAGO = "https://www.mercadopago.com.ar/checkout_stub_link_REEMPLAZAR";
const ENLACE_PAYPAL = "https://www.paypal.com/donate?hosted_button_id=REEMPLAZAR";
const DIAGRAM_CONTACT_EMAIL = "jujuyconecta@gmail.com";

export default function ApoyarPage(): JSX.Element {
  const [amount, setAmount] = useState<string>("");
  const [monthly, setMonthly] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [sponsorName, setSponsorName] = useState<string>("");
  const [sponsorEmail, setSponsorEmail] = useState<string>("");
  const [sponsorMsg, setSponsorMsg] = useState<string>("");
  const { toast } = useToast();

  function handleDonateCheckout(method: "mercadopago" | "paypal") {
    // Aquí normalmente redirigís al checkout con metadata; por ahora abrimos el link placeholder
    if (method === "mercadopago") {
      window.open(ENLACE_MERCADOPAGO, "_blank");
    } else {
      window.open(ENLACE_PAYPAL, "_blank");
    }
  }

  function submitSupportForm(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: enviá esto a tu backend o servicio de mails
    toast({
      title: "Gracias",
      description: "Recibimos tu mensaje. Nos contactamos a la brevedad.",
    });
    setAmount("");
    setMessage("");
  }

  function submitSponsorForm(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: enviar a backend o crear lead en CRM
    toast({
      title: "Solicitud enviada",
      description: "Gracias por interesarte en patrocinar. Te escribimos pronto.",
    });
    setSponsorName("");
    setSponsorEmail("");
    setSponsorMsg("");
  }

  return (
    <Layout>
      <main className="container mx-auto px-4 py-12">
        {/* HERO */}
        <section className="mb-8 grid gap-6 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl font-extrabold">Apoyá a Jujuy Conecta 💚</h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
            Jujuy Conecta es mucho más que un medio.
            Es una comunidad construida a puro esfuerzo, con la misión de mostrar lo que realmente pasa en nuestra tierra. Cada historia, cada videopodcast, cada reporte local se hace con pasión, pero también con trabajo, horas y recursos.
            Si valorás el contenido independiente, cercano y jujeño, tu aporte nos da oxígeno para seguir conectando voces, barrios y sueños.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="#formas"
                className="inline-flex items-center gap-2 px-4 py-3 rounded bg-primary text-black"
              >
                ❤️ Cómo ayudar
              </a>

              <a
                href="#patrocinio"
                className="inline-flex items-center gap-2 px-4 py-3 rounded border"
              >
                 🎁 Convertite en patrocinador
              </a>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Por qué tu ayuda hace la diferencia</CardTitle>
                <CardDescription>Nuestro trabajo es local, independiente y hecho por gente de acá.
                  Pero sostenerlo requiere mucho más que ganas:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Traslados y logística para cubrir historias en territorio.</li>
                  <li>• Equipos, edición y producción audiovisual.</li>
                  <li>• Hosting, mantenimiento técnico y herramientas digitales.</li>
                  <li>• Tiempo, dedicación y compromiso ético para garantizar información verificada y plural.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-8" />

        {/* FORMAS DE APOYAR */}
        <section id="formas" className="grid gap-6 md:grid-cols-3 mb-10">
          <Card>
            <CardHeader>
              <CardTitle>Formas de apoyar</CardTitle>
              <CardDescription>Hay muchas maneras de sumar.
                Desde una donación puntual hasta una colaboración recurrente o en especie.
                Todo suma, porque detrás de cada aporte hay una historia que sigue contándose.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Elegí un monto y completá el checkout. Podés donar una vez o suscribirte mensualmente.
              </p>

              <div className="mt-3">
                <label className="text-xs text-muted-foreground">Monto (ARS)</label>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    aria-label="Monto de donación"
                  />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={monthly}
                    onChange={(e) => setMonthly(e.target.checked)}
                    id="monthly"
                    className="rounded"
                  />
                  <label htmlFor="monthly" className="text-sm text-muted-foreground">Quiero que sea mensual</label>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      if (!amount) {
                        toast({ title: "Completar monto", description: "Especificá un monto para continuar." });
                        return;
                      }
                      // idealmente montar payload con metadata (monto, mensualidad)
                      handleDonateCheckout("mercadopago");
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-2" /> Pagar con MercadoPago
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!amount) {
                        toast({ title: "Completar monto", description: "Especificá un monto para continuar." });
                        return;
                      }
                      handleDonateCheckout("paypal");
                    }}
                  >
                    PayPal
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Si preferís, podés hacer una transferencia bancaria. Abajo están los datos.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transferencia bancaria</CardTitle>
              <CardDescription>Para donaciones directas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Datos de la cuenta.
              </p>

              <div className="mt-3 text-sm">
                <p><strong>Banco:</strong> BANCO</p>
                <p><strong>CBU / CVU:</strong> 0000000000000000000000</p>
                <p><strong>Alias:</strong> jujuyconecta</p>
                <p><strong>Titular:</strong> Fundación </p>
              </div>

              <div className="mt-4">
                <Button
                  size="sm"
                  onClick={() =>
                    toast({
                      title: "Copiado",
                      description: "Datos bancarios copiados al portapapeles (ejemplo).",
                    })
                  }
                >
                  Copiar datos
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Donación en especie / colaboración</CardTitle>
              <CardDescription>Material, difusión o espacios</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                También aceptamos apoyo en especie: espacios para grabar, equipo prestado, difusión de eventos o
                alianzas con organizaciones.
              </p>

              <div className="mt-3">
              <a
                  onClick={() =>
                    toast({
                    title: "Muchas gracias",
                    description: "Escribinos y coordinamos la colaboración.",
                  })
                }
                href="#patrocinio"
                className="inline-flex items-center gap-2 px-4 py-3 rounded border"
              >
                 🎁 Conactar para donar en especie
              </a>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-8" />

        {/* TRANSPARENCIA */}
        <section className="mb-10">
          <Card>
            <CardHeader>
              <CardTitle>Transparencia</CardTitle>
              <CardDescription>Cómo usamos las donaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                  En Jujuy Conecta creemos que la confianza se construye con hechos.
                  Publicamos reportes trimestrales sobre cómo usamos cada donación, para que sepas exactamente en qué se invierte tu apoyo.
              </p>

              <div className="mt-4 grid md:grid-cols-3 gap-4">
                <div className="text-center p-3">
                  <div className="text-sm font-semibold">50%</div>
                  <div className="text-xs text-muted-foreground">Producción y periodistas</div>
                </div>
                <div className="text-center p-3">
                  <div className="text-sm font-semibold">30%</div>
                  <div className="text-xs text-muted-foreground">Infraestructura y hosting</div>
                </div>
                <div className="text-center p-3">
                  <div className="text-sm font-semibold">20%</div>
                  <div className="text-xs text-muted-foreground">Proyectos especiales</div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                  No hay sponsors ocultos ni intereses externos.
                  Solo personas que creen, como vos, en un periodismo que conecta desde lo real.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-8" />

        {/* BENEFICIOS Y PATROCINIO */}
        <section id="patrocinio" className="mb-10 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pequeños gestos, grandes impactos</CardTitle>
              <CardDescription>Apoyar no es solo dar — es formar parte de algo más grande.
              Quienes colaboran son parte visible de nuestra comunidad y tienen acceso a beneficios especiales:</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>• Mención en la página de agradecimientos (para donaciones recurrentes o mayores).</li>
                <li>• Espacios de difusión para emprendimientos locales.</li>
                <li>• Acceso anticipado a investigaciones y reportajes.</li>
                <li>• Posibilidad de co-patrocinar secciones o episodios del videopodcast.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Convertite en patrocinador de un cambio real</CardTitle>
              <CardDescription>Si sos empresa, organización o emprendimiento y querés generar impacto local, podés hacerlo patrocinando contenidos o proyectos especiales.
              Juntos podemos visibilizar causas, fomentar la cultura y hacer crecer el tejido emprendedor de Jujuy.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitSponsorForm} className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Nombre o Empresa</label>
                  <Input value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder="Tu nombre o empresa" />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <Input value={sponsorEmail} onChange={(e) => setSponsorEmail(e.target.value)} placeholder="mail@ejemplo.com" />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Mensaje / propuesta</label>
                  <Textarea value={sponsorMsg} onChange={(e) => setSponsorMsg(e.target.value)} placeholder="Contanos cómo querés colaborar" />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Enviar propuesta</Button>
                  <Button variant="outline" onClick={() => {
                    setSponsorName("");
                    setSponsorEmail("");
                    setSponsorMsg("");
                  }}>Limpiar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-8" />

        {/* CONTACTO Y CIERRE */}
        <section className="mb-4">
          <Card>
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">¿Querés hablar directamente con nosotros?</h3>
                <p className="text-sm text-muted-foreground mt-1">Si tenés dudas, ideas o querés coordinar un apoyo personalizado, escribinos a: <strong>{DIAGRAM_CONTACT_EMAIL}</strong></p>
              </div>

              <div className="flex gap-3">
                <a href={`mailto:${DIAGRAM_CONTACT_EMAIL}`} className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-black">
                  <Mail className="w-4 h-4" /> Escribir
                </a>

                <a href="#formas" className="inline-flex items-center gap-2 px-4 py-2 rounded border">
                  <FileText className="w-4 h-4" /> Ver formas de apoyo
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </Layout>
  );
}
