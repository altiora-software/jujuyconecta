"use client";

import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

import {
  Sparkles,
  Target,
  Users,
  LineChart,
  CheckCircle2,
  MessageCircle,
  Clock,
} from "lucide-react";

type Stage =
  | "idea"
  | "primeros_clientes"
  | "negocio_en_marcha"
  | "quiero_escalar";

interface FormState {
  name: string;
  email: string;
  whatsapp: string;
  projectName: string;
  stage: Stage | "";
  challenge: string;
}

export default function AsesoriaStartupPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    whatsapp: "",
    projectName: "",
    stage: "",
    challenge: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.whatsapp || !form.challenge) {
      toast({
        title: "Datos incompletos",
        description: "Completá al menos nombre, mail, WhatsApp y el desafío que querés trabajar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Ajustá el nombre de la tabla a lo que definas en Supabase
    //   const { error } = await supabase.from("startup_advisory_requests").insert({
    //     name: form.name,
    //     email: form.email,
    //     whatsapp: form.whatsapp,
    //     project_name: form.projectName || null,
    //     stage: form.stage || null,
    //     challenge: form.challenge,
    //     source: "web_asesoria_startup",
    //   });

    //   if (error) throw error;

    //   toast({
    //     title: "Solicitud enviada",
    //     description: "Te vamos a responder por mail o WhatsApp en un plazo razonable. Si ves que no respondemos, insistí.",
    //   });

    //   setForm({
    //     name: "",
    //     email: "",
    //     whatsapp: "",
    //     projectName: "",
    //     stage: "",
    //     challenge: "",
    //   });
    } catch (err: any) {
      console.error("Error enviando solicitud de asesoría:", err);
      toast({
        title: "No se pudo enviar",
        description:
          "Hubo un problema técnico al guardar tu solicitud. Podés escribirnos directo por WhatsApp mientras lo revisamos.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const stageLabel = (s: Stage) => {
    switch (s) {
      case "idea":
        return "Tengo una idea y quiero validarla";
      case "primeros_clientes":
        return "Tengo pocos clientes y quiero ordenar el negocio";
      case "negocio_en_marcha":
        return "Negocio en marcha, quiero profesionalizarlo";
      case "quiero_escalar":
        return "Quiero escalar con tecnología y marketing";
      default:
        return "";
    }
  };

  const stages: Stage[] = [
    "idea",
    "primeros_clientes",
    "negocio_en_marcha",
    "quiero_escalar",
  ];

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-10">
        {/* Hero */}
        <section className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs md:text-sm shadow-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Asesoría para emprendedores y negocios de Jujuy</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
              Sesiones uno a uno para ordenar tu negocio
              <span className="text-primary"> sin humo, sin promesas mágicas.</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              No es un curso grabado ni un programa eterno. Es una asesoría táctica para que tomes
              decisiones concretas sobre tu producto, tus ventas y tu presencia digital, con foco en Jujuy.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3 text-xs md:text-sm">
            <div className="rounded-lg border bg-card/70 px-3 py-2 flex items-start gap-2">
              <Target className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold">Diagnóstico real</p>
                <p className="text-muted-foreground">
                  Revisamos tu negocio como es ahora, no como te gustaría que fuese.
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card/70 px-3 py-2 flex items-start gap-2">
              <LineChart className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold">Acciones concretas</p>
                <p className="text-muted-foreground">
                  Salís con pocos pasos claros, priorizados, que podés ejecutar la misma semana.
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card/70 px-3 py-2 flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold">Cupos limitados</p>
                <p className="text-muted-foreground">
                  Atendemos pocas asesorías por mes para no llenarnos de reuniones vacías.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Para quién es / no es */}
        <section className="grid gap-6 md:grid-cols-2">
          <Card className="border-green-500/40">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Users className="h-5 w-5 text-green-600" />
                Para quién es
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  Tenés un emprendimiento, negocio local o proyecto digital con algo de movimiento y querés dejar de improvisar.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  Estás dispuesto a ejecutar cambios después de la sesión, aunque incomoden.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  Valorás una mirada externa que te diga lo que nadie alrededor te está diciendo.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-destructive/40">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <MessageCircle className="h-5 w-5 text-destructive" />
                Para quién no es
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-destructive mt-0.5" />
                  Si solo querés “charlar de ideas” sin intención real de ejecutar.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-destructive mt-0.5" />
                  Si buscás que alguien valide todo lo que ya decidiste en lugar de desafiarlo.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-destructive mt-0.5" />
                  Si esperás una solución mágica sin revisar precios, propuesta de valor o experiencia del cliente.
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Cómo funciona */}
        <section className="space-y-4">
          <Card className="bg-muted/40 border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Cómo funciona la asesoría</CardTitle>
              <CardDescription className="text-sm">
                Pocas etapas, todo claro desde el principio.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="space-y-1">
                <Badge variant="outline" className="mb-1">
                  Paso 1
                </Badge>
                <p className="font-medium">Enviás tu contexto</p>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Completás el formulario con lo que vendés, dónde estás trabado y qué esperás de la sesión.
                </p>
              </div>
              <div className="space-y-1">
                <Badge variant="outline" className="mb-1">
                  Paso 2
                </Badge>
                <p className="font-medium">Revisamos tu caso</p>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Si creemos que podemos aportar algo real, coordinamos día y horario. Si no, te lo decimos.
                </p>
              </div>
              <div className="space-y-1">
                <Badge variant="outline" className="mb-1">
                  Paso 3
                </Badge>
                <p className="font-medium">Sesión y próximos pasos</p>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Hacemos la sesión por Meet o presencial en Jujuy y cerramos con un resumen de acciones concretas.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Formulario */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg md:text-xl font-semibold">
              Pedir una sesión de diagnóstico
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl">
              El envío del formulario no garantiza que tomemos el caso. Si vemos que no somos la mejor opción para vos, te lo vamos a decir antes de hacerte perder tiempo y plata.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      Nombre y apellido
                    </label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Cómo te llamás"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      Mail de contacto
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      WhatsApp
                    </label>
                    <Input
                      name="whatsapp"
                      value={form.whatsapp}
                      onChange={handleChange}
                      placeholder="Ej: 388..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      Nombre del emprendimiento o negocio
                    </label>
                    <Input
                      name="projectName"
                      value={form.projectName}
                      onChange={handleChange}
                      placeholder="Opcional, pero ayuda"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    En qué etapa estás
                  </label>
                  <div className="grid gap-2 md:grid-cols-2">
                    {stages.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, stage: s }))
                        }
                        className={`text-left rounded-lg border px-3 py-2 text-xs md:text-sm transition-smooth ${
                          form.stage === s
                            ? "border-primary bg-primary/5"
                            : "bg-background hover:bg-muted/60"
                        }`}
                      >
                        <span className="font-medium block mb-0.5">
                          {stageLabel(s)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Qué problema concreto querés resolver
                  </label>
                  <Textarea
                    name="challenge"
                    value={form.challenge}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Ejemplos: no logro que la gente entienda qué vendo, tengo visitas pero no convierten, dependo solo de Instagram, quiero ordenar precios y propuesta de valor, etc."
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Cuanto más honesto seas acá, más fácil va a ser saber si podemos ayudarte.
                  </p>
                </div>

                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-xs text-muted-foreground max-w-md">
                    Al enviar este formulario aceptás que te contactemos por mail o WhatsApp
                    con preguntas de contexto y para coordinar la sesión si encaja.
                  </p>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="mt-1 md:mt-0"
                  >
                    {submitting ? "Enviando..." : "Enviar solicitud de asesoría"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
