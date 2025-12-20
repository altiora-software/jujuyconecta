"use client";

import { useEffect, useMemo, useState } from "react";
import { TourismHotel } from "@/components/types/TourismHotels";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Globe,
  Star,
  CalendarRange,
  ExternalLink,
  Copy,
  Navigation,
  Users,
  BedDouble,
  Baby,
} from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotel: TourismHotel | null;
};

function getOrCreateSessionId() {
  const key = "jc_session_id";
  let v = localStorage.getItem(key);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(key, v);
  }
  return v;
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysISO(baseISO: string, days: number) {
  const d = new Date(baseISO + "T00:00:00");
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function diffDaysISO(aISO: string, bISO: string) {
  // b - a in days
  const a = new Date(aISO + "T00:00:00").getTime();
  const b = new Date(bISO + "T00:00:00").getTime();
  const ms = b - a;
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function clampInt(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function safeUrl(url?: string | null) {
  if (!url) return null;
  return url.startsWith("http") ? url : `https://${url}`;
}

export function HotelDetailsDialog({ open, onOpenChange, hotel }: Props) {
  const [checkin, setCheckin] = useState<string>(todayISO());
  const [checkout, setCheckout] = useState<string>(addDaysISO(todayISO(), 2));
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [rooms, setRooms] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // reset cuando cambia hotel o se abre
  useEffect(() => {
    if (open) {
      const t = todayISO();
      setCheckin(t);
      setCheckout(addDaysISO(t, 2));
      setAdults(2);
      setChildren(0);
      setRooms(1);
    }
  }, [open, hotel?.id]);

  // Innovación útil: si el usuario pone checkout inválido, lo corregimos suave
  useEffect(() => {
    if (!checkin || !checkout) return;
    const nights = diffDaysISO(checkin, checkout);
    if (nights < 1) {
      setCheckout(addDaysISO(checkin, 1));
    }
  }, [checkin, checkout]);

  const canBook = useMemo(() => !!hotel?.booking_url && !!hotel?.id, [hotel]);

  const nights = useMemo(() => {
    if (!checkin || !checkout) return 0;
    return diffDaysISO(checkin, checkout);
  }, [checkin, checkout]);

  const subtitle = useMemo(() => {
    const base = hotel?.region || hotel?.city || "Jujuy";
    return base + (hotel?.address ? ` · ${hotel.address}` : "");
  }, [hotel]);

  const reserveOnBooking = async () => {
    if (!hotel?.id) return;

    try {
      setLoading(true);

      const resp = await fetch("/api/create-deeplink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel_id: hotel.id,
          session_id: getOrCreateSessionId(),
          checkin,
          checkout,
          adults,
          children,
          rooms,
          lang: "es",
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Failed to generate deeplink");

      window.location.href = data.deeplink_url;
    } catch (e) {
      console.error(e);
      alert("No se pudo abrir Booking. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    if (!hotel?.whatsapp) return;
    const digits = hotel.whatsapp.replace(/[^\d]/g, "");
    const text = encodeURIComponent(
      `Hola! Quisiera consultar por disponibilidad en ${hotel.name}.`
    );
    window.open(`https://wa.me/${digits}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const openWebsite = () => {
    const url = safeUrl(hotel?.website);
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openMap = () => {
    const lat = hotel?.latitude;
    const lng = hotel?.longitude;
    if (typeof lat !== "number" || typeof lng !== "number") return;

    const label = encodeURIComponent(hotel?.name || "Alojamiento");
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${label}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    const url = safeUrl(hotel?.website) || hotel?.booking_url || hotel?.image_url;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copiado");
    } catch {
      alert("No se pudo copiar el link");
    }
  };

  const Stepper = ({
    label,
    value,
    onChange,
    min,
    max,
    icon,
  }: {
    label: string;
    value: number;
    onChange: (n: number) => void;
    min: number;
    max: number;
    icon?: React.ReactNode;
  }) => {
    return (
      <div className="rounded-2xl border border-border/70 bg-background p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium">
              {icon}
              <span className="truncate">{label}</span>
            </div>
            {/* <div className="text-xs text-muted-foreground">
              Ajustá rápido, pensado para móvil.
            </div> */}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-9 rounded-xl px-0"
              onClick={() => onChange(clampInt(value - 1, min, max))}
              disabled={value <= min}
              aria-label={`Bajar ${label}`}
            >
              –
            </Button>
            <div className="w-10 text-center tabular-nums font-semibold">
              {value}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-9 rounded-xl px-0"
              onClick={() => onChange(clampInt(value + 1, min, max))}
              disabled={value >= max}
              aria-label={`Subir ${label}`}
            >
              +
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const PrimaryCTA = (
    <Button
      className="rounded-2xl w-full"
      onClick={reserveOnBooking}
      disabled={!canBook || loading}
    >
      {loading ? "Abriendo Booking..." : canBook ? "Reservar en Booking" : "Sin link de Booking"}
      <ExternalLink className="h-4 w-4 ml-2" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={[
          "p-0",
          "w-[calc(100vw-1.5rem)] sm:w-full",
          "max-w-[560px] md:max-w-3xl",
          "rounded-3xl",
          "max-h-[90vh] overflow-hidden",
        ].join(" ")}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Detalles del hotel</DialogTitle>
        </DialogHeader>

        {/* CONTENEDOR SCROLL INTERNO */}
        <div className="relative max-h-[90vh] overflow-y-auto">
          {/* HERO */}
          <div className="relative">
            <div className="rounded-t-3xl overflow-hidden border-b border-border/70 bg-muted">
              {hotel?.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hotel.image_url}
                  alt={hotel.name}
                  className="w-full h-[220px] sm:h-[260px] md:h-[320px] object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-[220px] sm:h-[260px] md:h-[320px] flex items-center justify-center text-sm text-muted-foreground">
                  Sin imagen
                </div>
              )}
            </div>

            {/* overlay info */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <div className="rounded-3xl border border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg sm:text-xl font-semibold truncate">
                        {hotel?.name || "Alojamiento"}
                      </span>

                      {hotel?.stars ? (
                        <Badge
                          variant="secondary"
                          className="rounded-full inline-flex items-center gap-1"
                        >
                          <Star className="h-3 w-3" />
                          {hotel.stars}★
                        </Badge>
                      ) : null}

                      {hotel?.category ? (
                        <Badge variant="outline" className="rounded-full">
                          {hotel.category}
                        </Badge>
                      ) : null}

                      {hotel?.booking_url ? (
                        <Badge className="rounded-full">Booking</Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-full">
                          Contacto directo
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{subtitle}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="rounded-2xl"
                      onClick={copyLink}
                      title="Copiar link"
                      disabled={!hotel?.website && !hotel?.booking_url && !hotel?.image_url}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="rounded-2xl"
                      onClick={openMap}
                      title="Abrir mapa"
                      disabled={
                        typeof hotel?.latitude !== "number" ||
                        typeof hotel?.longitude !== "number"
                      }
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* micro info */}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary" className="rounded-full">
                    {nights >= 1 ? `${nights} noche${nights > 1 ? "s" : ""}` : "Elegí fechas"}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    {adults} adultos
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    {children} niños
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    {rooms} hab.
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="px-4 sm:px-6 pb-28 pt-5 space-y-5">
            {/* Descripción + amenities */}
            <div className="space-y-2">
              <p className="text-sm sm:text-[15px] text-foreground/90 leading-relaxed">
                {hotel?.description || "Alojamiento disponible en Jujuy."}
              </p>

              {hotel?.amenities?.length ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {hotel.amenities.slice(0, 12).map((a) => (
                    <Badge key={a} variant="secondary" className="rounded-full text-[11px]">
                      {a}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Todavía no cargaron amenities. Si sos admin, completalo para mejorar conversión.
                </div>
              )}
            </div>

            {/* Reserva */}
            <div className="rounded-3xl border border-border/70 bg-card/70 p-4 sm:p-5 space-y-4">
              <div className="flex items-start gap-2">
                <CalendarRange className="h-4 w-4 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">Fechas y huéspedes</div>
                  <div className="text-xs text-muted-foreground">
                    Abrimos Booking con tu búsqueda ya armada.
                  </div>
                </div>
              </div>

              {/* Fechas: mobile first, stack. En sm: 2 columnas */}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs text-muted-foreground">
                  Check-in
                  <input
                    type="date"
                    value={checkin}
                    onChange={(e) => setCheckin(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-input bg-background px-3 text-sm text-foreground"
                  />
                </label>

                <label className="space-y-1 text-xs text-muted-foreground">
                  Check-out
                  <input
                    type="date"
                    value={checkout}
                    min={addDaysISO(checkin, 1)}
                    onChange={(e) => setCheckout(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-input bg-background px-3 text-sm text-foreground"
                  />
                </label>
              </div>

              {/* Steppers: mejor UX en mobile */}
              <div className="grid gap-3 sm:grid-cols-3">
                <Stepper
                  label="Adultos"
                  value={adults}
                  onChange={(n) => setAdults(n)}
                  min={1}
                  max={10}
                  icon={<Users className="h-4 w-4" />}
                />
                <Stepper
                  label="Niños"
                  value={children}
                  onChange={(n) => setChildren(n)}
                  min={0}
                  max={10}
                  icon={<Baby className="h-4 w-4" />}
                />
                <Stepper
                  label="Habitaciones"
                  value={rooms}
                  onChange={(n) => setRooms(n)}
                  min={1}
                  max={6}
                  icon={<BedDouble className="h-4 w-4" />}
                />
              </div>

              {!canBook ? (
                <div className="rounded-2xl border border-border/70 bg-background p-3 text-xs text-muted-foreground">
                  Este alojamiento todavía no tiene link de Booking cargado.
                  Abajo podés contactarlo directo.
                </div>
              ) : null}
            </div>

            {/* Contacto directo */}
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                className="rounded-2xl h-11"
                onClick={openWhatsApp}
                disabled={!hotel?.whatsapp}
              >
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>

              <Button
                variant="outline"
                className="rounded-2xl h-11"
                onClick={openWebsite}
                disabled={!hotel?.website}
              >
                <Globe className="h-4 w-4 mr-2" />
                Sitio web
              </Button>
            </div>

            {/* Debug/backup */}
            {hotel?.booking_url ? (
              <div className="text-[11px] text-muted-foreground">
                Link base disponible.
              </div>
            ) : null}
          </div>

          {/* Sticky bottom actions */}
          <div className="fixed sm:absolute bottom-0 left-0 right-0 z-10">
            <div className="mx-auto max-w-[560px] md:max-w-3xl">
              <div className="border-t border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 px-4 sm:px-6 py-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {PrimaryCTA}
                  <Button
                    variant="secondary"
                    className="rounded-2xl w-full"
                    onClick={() => onOpenChange(false)}
                  >
                    Cerrar
                  </Button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
