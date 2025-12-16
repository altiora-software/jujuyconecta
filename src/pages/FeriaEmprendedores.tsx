"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ArrowRight,
  MapPin,
  Sparkles,
  CheckCircle2,
  Clock,
  Store,
  Instagram,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";

function trackGAEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  const gtag = (window as any).gtag;
  if (!gtag) return;
  gtag("event", eventName, {
    section: "feria",
    page: "/feria-emprendedores",
    ...params,
  });
}

const SOURCE = "feria_20";
const IG_HANDLE = "@jujuyconecta";
const FEATURED_DAYS_TEXT = "1 semana";

const RUBROS = [
  "Gastronomía",
  "Indumentaria",
  "Artesanías",
  "Belleza",
  "Servicios",
  "Tecnología",
  "Hogar y Deco",
  "Regalería",
  "Salud y Bienestar",
  "Otro",
] as const;

type ContactType = "instagram" | "whatsapp";

type FormState = {
  name: string;
  category: string;
  contactType: ContactType;
  contactValue: string;
  municipality: string;
  hasPhysicalStore: boolean;
  email: string;
  wantsFeatured: boolean;
  shareCommitment: boolean;
};

function clean(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

function normalizeInstagram(v: string) {
  const s = clean(v);
  if (!s) return s;
  if (s.startsWith("http")) return s;
  return s.startsWith("@") ? s.slice(1) : s;
}

function normalizePhone(v: string) {
  return clean(v);
}

function isValidEmail(v: string) {
  const s = clean(v);
  if (!s) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function FeriaEmprendedores() {
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showFeaturedRules, setShowFeaturedRules] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: "",
    category: "",
    contactType: "instagram",
    contactValue: "",
    municipality: "",
    hasPhysicalStore: false,
    email: "",
    wantsFeatured: false,
    shareCommitment: false,
  });

  useEffect(() => {
    trackGAEvent("feria_page_view", { location: window.location.href });
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
  };

  const errors = useMemo(() => {
    const name = clean(form.name);
    const category = clean(form.category);
    const muni = clean(form.municipality);
    const contact = clean(form.contactValue);

    return {
      name: name.length < 2 ? "Nombre obligatorio" : "",
      category: category.length < 2 ? "Rubro obligatorio" : "",
      municipality: muni.length < 2 ? "Zona obligatoria" : "",
      contactValue: contact.length < 3 ? "Contacto obligatorio" : "",
      email: !isValidEmail(form.email) ? "Email inválido" : "",
      shareCommitment:
        form.wantsFeatured && !form.shareCommitment
          ? "Para el destacado tenés que aceptar compartir y etiquetar"
          : "",
    };
  }, [form]);

  const hasBlockingErrors = useMemo(() => {
    const emailBlocks = !!errors.email && clean(form.email).length > 0;

    return (
      !!errors.name ||
      !!errors.category ||
      !!errors.municipality ||
      !!errors.contactValue ||
      !!errors.shareCommitment ||
      emailBlocks
    );
  }, [errors, form.email]);

  const markAllTouched = () => {
    setTouched({
      name: true,
      category: true,
      municipality: true,
      contactValue: true,
      email: true,
      shareCommitment: true,
    });
  };

  const submit = async () => {
    if (submitting || success) return;

    if (hasBlockingErrors) {
      markAllTouched();

      const first =
        errors.name ||
        errors.category ||
        errors.contactValue ||
        errors.municipality ||
        (errors.email && clean(form.email).length > 0 ? errors.email : "") ||
        errors.shareCommitment;

      toast({
        title: "Falta completar datos",
        description: first || "Revisá los campos marcados.",
        variant: "destructive",
      });

      trackGAEvent("feria_submit_blocked", {
        reason: first || "validation",
        wants_featured: form.wantsFeatured,
        contact_type: form.contactType,
      });

      return;
    }

    setSubmitting(true);

    trackGAEvent("feria_submit_start", {
      wants_featured: form.wantsFeatured,
      contact_type: form.contactType,
      category: form.category,
    });

    const name = clean(form.name);
    const category = clean(form.category);
    const municipality = clean(form.municipality);

    const contactValueRaw = clean(form.contactValue);
    const instagram =
      form.contactType === "instagram"
        ? normalizeInstagram(contactValueRaw)
        : null;
    const whatsapp =
      form.contactType === "whatsapp" ? normalizePhone(contactValueRaw) : null;

    const payload = {
      name,
      category,
      type: "emprendimiento",
      municipality,

      instagram,
      whatsapp,

      has_physical_store: !!form.hasPhysicalStore,
      email: clean(form.email) || null,

      // Solo guardamos intención y compromiso, ustedes verifican y habilitan manual.
      wants_featured: !!form.wantsFeatured,
      share_commitment: !!form.shareCommitment,

      source_type: SOURCE,
      status: "pending",
    };

    const { data, error } = await supabase
      .from("local_business_submissions")
      // @ts-expect-error: payload type workaround for Supabase types
      .insert(payload)
      .select("id")
      .single();

    setSubmitting(false);

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);

      trackGAEvent("feria_submit_error", {
        message: error.message,
        code: (error as any).code,
        details: (error as any).details,
      });

      toast({
        title: "No se pudo enviar",
        description: `${error.message}${
          (error as any).details ? ` · ${(error as any).details}` : ""
        }`,
        variant: "destructive",
      });

      return;
    }

    setSuccess(true);

    trackGAEvent("feria_submit_success", {
      id: (data as { id?: string | number } | null)?.id,
      wants_featured: !!form.wantsFeatured,
      share_commitment: !!form.shareCommitment,
    });

    toast({
      title: "Solicitud enviada",
      description: form.wantsFeatured
        ? `Listo. Si compartís y etiquetás a ${IG_HANDLE}, te activamos ${FEATURED_DAYS_TEXT} de destacado cuando lo verifiquemos.`
        : "Tu emprendimiento ya está en proceso de publicación.",
    });
  };

  const inputErrorClass = (key: keyof typeof errors) => {
    const hasErr = !!errors[key];
    const show = !!touched[key];
    return show && hasErr
      ? "border-destructive focus-visible:ring-destructive"
      : "";
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-6 md:py-10 space-y-8">
        <section className="space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
            <div className="relative overflow-hidden rounded-3xl border border-green-500/35 bg-gradient-to-br from-green-500/15 via-background to-background p-6 md:p-8 shadow-[0_0_40px_rgba(34,197,94,0.18)] flex-1">
              <div className="absolute -right-20 -top-10 h-40 w-40 rounded-full bg-green-400/25 blur-2xl" />

              <div className="flex items-center gap-3 mb-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500/20 border border-green-300/40">
                  <Store className="h-5 w-5 text-foreground" />
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Feria de emprendedores
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="rounded-full" variant="secondary">
                      Jujuy Conecta
                    </Badge>
                    <Badge className="rounded-full" variant="outline">
                      Registro rápido
                    </Badge>
                  </div>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
                Sumá tu emprendimiento gratis al mapa digital de Jujuy Conecta
                <span className="text-primary"> y hacete encontrar.</span>
              </h1>

              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                Perfil público con link, aparición en el mapa y difusión desde la comunidad.
              </p>

              <div className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mt-0.5" />
                <p>Te toma 60 segundos. Si lo completás ahora, entrás en la tanda de publicación primero.</p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3 text-xs">
                <div className="rounded-2xl border p-3 bg-background/50">
                  <p className="font-semibold">Perfil público con link</p>
                </div>
                <div className="rounded-2xl border p-3 bg-background/50">
                  <p className="font-semibold">Aparición en el mapa</p>
                </div>
                <div className="rounded-2xl border p-3 bg-background/50">
                  <p className="font-semibold">Difusión comunitaria</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-5 md:p-6 flex flex-col justify-between gap-5 w-full lg:max-w-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Upgrade opcional: {FEATURED_DAYS_TEXT} de destacados</p>
                    <p className="text-xs text-muted-foreground">
                      Si compartís en historias y etiquetás a {IG_HANDLE}, te damos {FEATURED_DAYS_TEXT} destacado.
                      Se activa cuando lo verificamos, sin automatizaciones.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Instagram className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Contacto directo</p>
                    <p className="text-xs text-muted-foreground">
                      Con Instagram o WhatsApp alcanza para que te contacten.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Zona clara</p>
                    <p className="text-xs text-muted-foreground">
                      La zona define dónde aparecés y cómo te encuentran en el mapa.
                    </p>
                  </div>
                </div>
              </div>

              {success ? (
                <Button asChild variant="secondary" className="rounded-2xl w-full">
                  <Link to={`/servicios/marketplace`}>Ver otros emprendimientos</Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  className="rounded-2xl w-full"
                  onClick={() => {
                    const el = document.getElementById("feria-form");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    trackGAEvent("feria_scroll_to_form");
                  }}
                >
                  Ir al formulario
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </section>

        <section id="feria-form">
          <Card className="rounded-3xl border border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Entrá en 60 segundos</CardTitle>
              <CardDescription>Un paso, una acción clara.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nombre del emprendimiento *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                    className={inputErrorClass("name")}
                    placeholder="Ej: La Bestia del Bajón"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submit();
                    }}
                  />
                  {touched.name && errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Rubro *</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => {
                      set("category", v);
                      setTouched((p) => ({ ...p, category: true }));
                    }}
                  >
                    <SelectTrigger className={`rounded-2xl ${inputErrorClass("category")}`}>
                      <SelectValue placeholder="Elegí un rubro" />
                    </SelectTrigger>
                    <SelectContent>
                      {RUBROS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {touched.category && errors.category && (
                    <p className="text-xs text-destructive">{errors.category}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Instagram o WhatsApp (uno solo) *</Label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Select
                    value={form.contactType}
                    onValueChange={(v) => {
                      set("contactType", v as ContactType);
                      setTouched((p) => ({ ...p, contactValue: true }));
                    }}
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="md:col-span-2 relative">
                    {form.contactType === "instagram" ? (
                      <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    )}

                    <Input
                      className={`pl-9 ${inputErrorClass("contactValue")}`}
                      value={form.contactValue}
                      onChange={(e) => set("contactValue", e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, contactValue: true }))}
                      placeholder={
                        form.contactType === "instagram"
                          ? "Ej: @miemprendimiento (o miemprendimiento)"
                          : "Ej: +54 388 ..."
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submit();
                      }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Tip: si ponés Instagram, no hace falta el “@”, lo limpiamos igual.
                </p>

                {touched.contactValue && errors.contactValue && (
                  <p className="text-xs text-destructive">{errors.contactValue}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Zona / ciudad *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className={`pl-9 ${inputErrorClass("municipality")}`}
                    value={form.municipality}
                    onChange={(e) => set("municipality", e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, municipality: true }))}
                    placeholder="Ej: San Salvador de Jujuy"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submit();
                    }}
                  />
                </div>
                {touched.municipality && errors.municipality && (
                  <p className="text-xs text-destructive">{errors.municipality}</p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-2xl border p-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">¿Tenés local físico?</p>
                  <p className="text-xs text-muted-foreground">
                    Ayuda a ordenar el mapa y mejorar tus visitas.
                  </p>
                </div>
                <Switch
                  checked={form.hasPhysicalStore}
                  onCheckedChange={(v) => set("hasPhysicalStore", v)}
                />
              </div>

              <div className="space-y-2">
                <Label>Email (opcional pero recomendado)</Label>
                <Input
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  className={inputErrorClass("email")}
                  placeholder="Ej: contacto@..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                  }}
                />
                {touched.email && errors.email && clean(form.email).length > 0 && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <Card className="rounded-3xl border border-primary/15 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Upgrade: {FEATURED_DAYS_TEXT} de destacados (verificación manual)
                  </CardTitle>
                  <CardDescription>
                    No usamos automatizaciones. Si compartís y etiquetás, lo verificamos y recién ahí te activamos el destacado.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border bg-background/60 p-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Quiero estar destacado</p>
                        <p className="text-xs text-muted-foreground">
                            Requisito: historia mostrando tu emprendimiento, etiqueta a {IG_HANDLE}. Dejar 24hs.
                        </p>
                    </div>
                    <Switch
                      checked={form.wantsFeatured}
                      onCheckedChange={(v) => {
                        set("wantsFeatured", v);
                        if (!v) set("shareCommitment", false);
                        setTouched((p) => ({ ...p, shareCommitment: true }));
                        trackGAEvent("feria_toggle_featured", { enabled: v });
                      }}
                    />
                  </div>

                  {form.wantsFeatured && (
                    <>
                      <div className="flex items-center justify-between rounded-2xl border bg-background/60 p-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Acepto compartir y etiquetar</p>
                          <p className="text-xs text-muted-foreground">
                            Al verificar tu historia, te damos {FEATURED_DAYS_TEXT} de destacados.
                          </p>
                        </div>
                        <Switch
                          checked={form.shareCommitment}
                          onCheckedChange={(v) => {
                            set("shareCommitment", v);
                            setTouched((p) => ({ ...p, shareCommitment: true }));
                            trackGAEvent("feria_toggle_share_commitment", { enabled: v });
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        className="text-left text-xs text-primary hover:underline"
                        onClick={() => {
                          setShowFeaturedRules((p) => !p);
                          trackGAEvent("feria_featured_info_open", { open: !showFeaturedRules });
                        }}
                      >
                        Ver cómo se verifica (manual)
                      </button>

                      {showFeaturedRules && (
                        <div className="rounded-2xl border bg-background/60 p-4 text-xs text-muted-foreground space-y-2">
                            <p className="font-medium text-foreground">
                            Dinámica para {FEATURED_DAYS_TEXT} destacados (verificación manual)
                            </p>

                            <p>
                            Importante: como tu emprendimiento todavía está en revisión, no podés compartir “tu ficha”
                            porque aún no existe. Lo que se comparte es una historia tuya mostrando el emprendimiento.
                            </p>

                            <ul className="list-disc pl-5 space-y-1">
                            <li>Seguí a {IG_HANDLE} en Instagram.</li>
                            <li>
                                Subí una historia mostrando tu emprendimiento (producto, stand, servicio o proceso).
                            </li>
                            <li>Etiquetá a {IG_HANDLE} en esa historia.</li>
                            <li>
                                Agregá el link al registro de la feria (esta página). Así entra más gente y se valida el flujo.
                            </li>
                            <li>Dejala publicada al menos 24 horas.</li>
                            <li>
                                Nosotros revisamos la mención, verificamos y, cuando aprobamos tu emprendimiento,
                                activamos {FEATURED_DAYS_TEXT} de destacado.
                            </li>
                            </ul>

                            <p>
                            Tip: si querés acelerar la verificación, mandá captura por DM a {IG_HANDLE} o por WhatsApp
                            (si lo cargaste en el formulario).
                            </p>
                        </div>
                        )}
                    </>
                  )}

                  {touched.shareCommitment && errors.shareCommitment && (
                    <p className="text-xs text-destructive">{errors.shareCommitment}</p>
                  )}
                </CardContent>
              </Card>

              <Button
                size="lg"
                className="rounded-2xl w-full"
                disabled={submitting || success}
                onClick={submit}
              >
                {success ? "Enviado" : submitting ? "Enviando…" : "Publicar mi emprendimiento"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {success && (
                <div className="rounded-3xl border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Tu emprendimiento ya está en proceso de publicación.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {form.wantsFeatured
                          ? `Si compartís en historias y etiquetás a ${IG_HANDLE}, lo verificamos y te activamos ${FEATURED_DAYS_TEXT} de destacado.`
                          : "Cuando se apruebe, aparece en el mapa y listados."}
                      </p>
                    </div>
                  </div>

                  <Button asChild variant="secondary" className="rounded-2xl w-full">
                    <Link to={`/servicios/marketplace`}>
                      Ver otros emprendimientos de la feria
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <footer className="pb-8 text-xs text-muted-foreground text-center mt-6">
            Si no aparecés, no existís.
          </footer>
        </section>
      </div>
    </Layout>
  );
}
