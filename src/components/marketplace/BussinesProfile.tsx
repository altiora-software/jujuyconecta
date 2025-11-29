// src/components/marketplace/BusinessProfile.tsx
"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Store,
  MapPin,
  Instagram,
  Globe,
  MessageCircle,
  Truck,
  Clock,
  Share2,
  Edit3,
  Sparkles,
} from "lucide-react";

// Si querés hacerlo prolijo, mové esto a un types.ts y reusalo en Marketplace
export interface LocalBusiness {
  id: string;
  name: string;
  category: string;
  type: string;
  municipality: string;
  address?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  instagram?: string | null;
  website?: string | null;
  image_url?: string | null;
  source_url?: string | null;
  source_type?: string | null;
  tags?: string[] | null;
  has_delivery?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
  updated_at?: string;
  is_featured?: boolean | null;
}

export interface BusinessProfileProps {
  item: LocalBusiness;
}

// PONÉ acá el número de WhatsApp de Jujuy Conecta
const JUJUY_CONECTA_WHATSAPP = "54388XXXXXXXX";

// ---------- helpers ----------
const buildBusinessSlug = (item: LocalBusiness) => {
  const nameSlug = item.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  // incluimos el id completo para que sea único y reversible
  return `${nameSlug}-${item.id}`;
};

const buildBusinessUrl = (item: LocalBusiness) => {
  if (typeof window === "undefined") return "";
  const base = `${window.location.origin}/servicios/marketplace/emprendimientos`;
  return `${base}/${buildBusinessSlug(item)}`;
};

const buildWhatsAppLink = (phone?: string | null, name?: string) => {
  if (!phone) return null;
  const clean = phone.replace(/[^\d]/g, "");
  const texto = encodeURIComponent(
    `Hola, vi este emprendimiento en el Marketplace de Jujuy Conecta y quiero más info sobre: ${
      name ?? "tu emprendimiento"
    }.`
  );
  return `https://wa.me/${clean}?text=${texto}`;
};

const buildEditRequestWhatsApp = (item: LocalBusiness) => {
  const url = buildBusinessUrl(item);
  const text = encodeURIComponent(
    `Hola, quiero actualizar los datos de mi emprendimiento en el Marketplace de Jujuy Conecta.\n\n` +
      `Nombre: ${item.name}\n` +
      `ID: ${item.id}\n` +
      `Link de la ficha: ${url}\n\n` +
      `Cambios que necesito:\n- `
  );
  return `https://wa.me/${JUJUY_CONECTA_WHATSAPP}?text=${text}`;
};

const shareBusiness = async (
  item: LocalBusiness,
  toast: ReturnType<typeof useToast>["toast"]
) => {
  if (typeof window === "undefined") return;

  const url = buildBusinessUrl(item);
  const title = item.name;
  const text = `Mirá este emprendimiento jujeño en el Marketplace de Jujuy Conecta: ${item.name}`;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch {
      // si cancela share, caemos al clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    toast({
      title: "Enlace copiado",
      description:
        "Copiamos el link del emprendimiento para que lo pegues donde quieras.",
    });
  } catch {
    toast({
      title: "No se pudo copiar el enlace",
      description: url,
      variant: "destructive",
    });
  }
};

const formatTypeLabel = (type?: string | null) => {
  if (!type) return "Emprendimiento local";
  const t = type.toLowerCase();
  if (t === "producto") return "Producto";
  if (t === "servicio") return "Servicio";
  if (t === "emprendimiento") return "Emprendimiento";
  return "Emprendimiento local";
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ---------- componente principal ----------
export function BusinessProfile({ item }: BusinessProfileProps) {
  const { toast } = useToast();

  const whatsappLink = buildWhatsAppLink(
    item.whatsapp ?? item.phone,
    item.name
  );
  const createdFull = formatDate(item.created_at);

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* fondo suave para que no sea tan plano */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />

      <div className="space-y-6">
        {/* chip superior */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs md:text-sm shadow-sm">
          <Store className="h-4 w-4 text-primary" />
          <span>Ficha de emprendimiento en el Marketplace local</span>
          {item.is_featured && (
            <Badge className="flex items-center gap-1 text-[11px] bg-yellow-400 text-black">
              <Sparkles className="h-3 w-3" />
              Destacado
            </Badge>
          )}
        </div>

        {/* HERO CARD */}
        <Card className="overflow-hidden border bg-card/90 backdrop-blur shadow-sm">
          {/* Imagen con overlay y badges */}
          <div className="relative h-56 md:h-64 w-full overflow-hidden bg-muted">
            {item.image_url ? (
              <>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                <div className="absolute left-4 bottom-4 space-y-1 text-white">
                  <p className="text-xs uppercase tracking-wide text-white/80">
                    {formatTypeLabel(item.type)}
                  </p>
                  <h1 className="text-xl md:text-2xl font-bold leading-tight">
                    {item.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-white/800">
                    {item.category && (
                      <Badge
                        variant="outline"
                        className="border-white/60 text-green-500 bg-black/20 text-[11px]"
                      >
                        {item.category}
                      </Badge>
                    )}
                    {item.municipality && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.municipality}
                      </span>
                    )}
                    {/* {createdFull && (
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3" />
                        Actualizado el {createdFull}
                      </span>
                    )} */}
                  </div>
                </div>

                {item.has_delivery && (
                  <Badge className="absolute right-4 top-4 flex items-center gap-1 bg-background/90 text-xs">
                    <Truck className="h-3 w-3" />
                    Envío disponible
                  </Badge>
                )}
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground opacity-80">
                <Store className="h-8 w-8" />
                <span className="text-sm">Sin imagen disponible</span>
              </div>
            )}
          </div>

          {/* resumen + CTAs */}
          <CardContent className="p-4 md:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 max-w-xl">
              <CardTitle className="text-lg md:text-xl">
                {item.name}
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                {item.address ||
                  `${item.category ?? "Emprendimiento"} en ${
                    item.municipality ?? "Jujuy"
                  }`}
              </CardDescription>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.tags.slice(0, 4).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[11px] font-normal"
                    >
                      #{tag}
                    </Badge>
                  ))}
                  {item.tags.length > 4 && (
                    <span className="text-[11px] text-muted-foreground">
                      +{item.tags.length - 4} más
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 min-w-[220px]">
              {whatsappLink && (
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => window.open(whatsappLink, "_blank")}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Escribir al emprendimiento
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => shareBusiness(item, toast)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir ficha
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* DETALLES CARD */}
        <Card className="border bg-card/90 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">
              Información del emprendimiento
            </CardTitle>
            <CardDescription className="text-sm">
              Datos de contacto, ubicación y enlaces directos para que la gente
              llegue a vos sin vueltas.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Dirección */}
            {item.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Dirección</p>
                  <p className="text-muted-foreground">{item.address}</p>
                </div>
              </div>
            )}

            {/* Contacto + redes */}
            <div className="grid gap-4 sm:grid-cols-2">
              {(item.phone || item.whatsapp) && (
                <div className="flex items-start gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Contacto directo</p>
                    {item.phone && (
                      <p className="text-muted-foreground">{item.phone}</p>
                    )}
                    {item.whatsapp && (
                      <p className="text-muted-foreground">
                        WhatsApp: {item.whatsapp}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(item.instagram || item.website) && (
                <div className="flex flex-col gap-2 text-sm">
                  {item.instagram && (
                    <button
                      type="button"
                      onClick={() => {
                        const url = item.instagram?.startsWith("http")
                          ? item.instagram
                          : `https://instagram.com/${item.instagram}`;
                        window.open(url, "_blank");
                      }}
                      className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      <Instagram className="h-4 w-4" />
                      Ver en Instagram
                    </button>
                  )}
                  {item.website && (
                    <button
                      type="button"
                      onClick={() => {
                        const url = item.website?.startsWith("http")
                          ? item.website
                          : `https://${item.website}`;
                        window.open(url, "_blank");
                      }}
                      className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      <Globe className="h-4 w-4" />
                      Ver sitio web
                    </button>
                  )}
                </div>
              )}
            </div>

            <Separator className="my-3" />

            {/* Acciones administrativas */}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
              <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
                Si este es tu emprendimiento y querés corregir o actualizar tus
                datos en el Marketplace, podés pedir la edición ahora mismo.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = buildEditRequestWhatsApp(item);
                  window.open(link, "_blank");
                }}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Actualizar datos de esta ficha
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
