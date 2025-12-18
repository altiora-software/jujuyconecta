"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ExternalLink } from "lucide-react";
import { TransportLine, TransportStop, TransportRawStop } from "./types";

function norm(s: unknown) {
  return String(s ?? "").trim();
}

function normalizeKey(s: unknown) {
  return norm(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function buildMapsQuery(r: TransportRawStop) {
  const base =
    norm((r as any).direccion) ||
    norm((r as any).address_raw) ||
    norm((r as any).stop_name);

  const city = norm((r as any).city) || "San Salvador de Jujuy";
  const prov = norm((r as any).province) || "Jujuy";
  const country = norm((r as any).country) || "Argentina";

  return `${base}, ${city}, ${prov}, ${country}`;
}

function hasCoords(x: any) {
  return (
    typeof x?.latitude === "number" &&
    Number.isFinite(x.latitude) &&
    typeof x?.longitude === "number" &&
    Number.isFinite(x.longitude)
  );
}

type StopItem = {
  id: string;
  order: number;
  title: string;
  address: string;
  gmaps: string;
  located: boolean;
  direction?: string;
};

export function TransportStopsList({
  lines,
  stops,
  rawStops,
  selectedLineId,
  selectedStopId,
  onSelectStop,
}: {
  lines: TransportLine[];
  stops: TransportStop[];
  rawStops: TransportRawStop[];
  selectedLineId?: string;
  selectedStopId: string | null;
  onSelectStop: (id: string | null) => void;
}) {
  const selectedLine = useMemo(
    () => lines.find((l) => l.id === selectedLineId),
    [lines, selectedLineId],
  );

  const rawForLine = useMemo(() => {
    if (!selectedLineId) return [];
    return (rawStops || [])
      .filter((r) => (r as any).line_id === selectedLineId)
      .sort(
        (a, b) =>
          Number((a as any).order_index ?? 0) -
          Number((b as any).order_index ?? 0),
      );
  }, [rawStops, selectedLineId]);

  const directions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rawForLine) {
      const d = norm((r as any).direction);
      if (!d) continue;
      const k = normalizeKey(d);
      if (!map.has(k)) map.set(k, d);
    }
    return Array.from(map.values());
  }, [rawForLine]);

  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedLineId || directions.length === 0) {
      setSelectedDirection(null);
      return;
    }
    const ok = selectedDirection
      ? directions.some((d) => normalizeKey(d) === normalizeKey(selectedDirection))
      : false;

    if (!ok) setSelectedDirection(directions[0]);
    onSelectStop(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLineId, directions.join("|")]);

  const rawForLineAndDir = useMemo(() => {
    if (!selectedDirection) return rawForLine;
    const key = normalizeKey(selectedDirection);
    return rawForLine.filter((r) => normalizeKey((r as any).direction) === key);
  }, [rawForLine, selectedDirection]);

  const stopsForLine = useMemo(() => {
    if (!selectedLineId) return [];
    return (stops || [])
      .filter((s) => s.line_id === selectedLineId)
      .sort((a, b) => a.order_index - b.order_index);
  }, [stops, selectedLineId]);

  const effective: StopItem[] = useMemo(() => {
    if (rawForLineAndDir.length > 0) {
      return rawForLineAndDir.map((r) => {
        const title =
          norm((r as any).stop_name) ||
          norm((r as any).direccion) ||
          norm((r as any).address_raw) ||
          "Parada";

        const address = norm((r as any).direccion) || norm((r as any).address_raw);

        const query = buildMapsQuery(r);
        const gmapsTextUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          query,
        )}`;

        const gmapsCoordsUrl = hasCoords(r)
          ? `https://www.google.com/maps?q=${(r as any).latitude},${(r as any).longitude}`
          : null;

        return {
          id: String((r as any).stop_id || (r as any).id),
          order: Number((r as any).order_index ?? 0),
          title,
          address,
          gmaps: gmapsCoordsUrl || gmapsTextUrl,
          located: Boolean(gmapsCoordsUrl),
          direction: norm((r as any).direction) || undefined,
        };
      });
    }

    return stopsForLine.map((s) => ({
      id: s.id,
      order: s.order_index,
      title: s.name,
      address: "",
      gmaps: `https://www.google.com/maps?q=${s.latitude},${s.longitude}`,
      located: true,
    }));
  }, [rawForLineAndDir, stopsForLine]);

  useEffect(() => {
    if (!selectedStopId) return;
    const el = document.getElementById(`stop-row-${selectedStopId}`);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selectedStopId]);

  if (!selectedLineId) {
    return (
      <Card className="rounded-2xl border border-dashed h-full">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Elegí una línea y tocá “Ver en mapa”.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border bg-background/70 h-full flex flex-col overflow-hidden">
      <CardContent className="p-3 space-y-3 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">
            Línea {selectedLine?.number} ·{" "}
            <span className="text-muted-foreground">{selectedLine?.name}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            {effective.length} paradas · {effective.filter((x) => x.located).length} ubicadas
          </p>
        </div>

        {/* Selector de sentido */}
        {directions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {directions.map((d) => {
              const active =
                selectedDirection &&
                normalizeKey(selectedDirection) === normalizeKey(d);

              return (
                <Button
                  key={normalizeKey(d)}
                  size="sm"
                  variant={active ? "default" : "outline"}
                  className="h-8 rounded-full text-[11px] shrink-0"
                  onClick={() => {
                    setSelectedDirection(d);
                    onSelectStop(null);
                  }}
                >
                  {d}
                </Button>
              );
            })}
          </div>
        )}

        {/* Lista: ESTO es lo que arregla el “se sale” */}
        <div className="min-h-0 flex-1 overflow-auto space-y-2 pr-1">
          {effective.map((s) => {
            const active = selectedStopId === s.id;

            return (
              <button
                key={s.id}
                id={`stop-row-${s.id}`}
                onClick={() => onSelectStop(s.id)}
                className={[
                  "w-full text-left rounded-xl border px-3 py-2 transition",
                  active
                    ? "bg-primary/10 border-primary/40"
                    : "bg-background hover:bg-muted/50",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {s.order}. {s.title}
                    </p>
                    {s.address ? (
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {s.address}
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        Sin dirección cargada
                      </p>
                    )}
                    {!s.located && (
                      <p className="text-[11px] text-amber-600">Ubicación aproximada</p>
                    )}
                  </div>

                  <a
                    href={s.gmaps}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 text-primary underline text-[11px] inline-flex items-center gap-1"
                  >
                    <MapPin className="h-4 w-4" />
                    Maps <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </button>
            );
          })}

          {effective.length === 0 && (
            <div className="rounded-xl border bg-background px-3 py-3 text-[12px] text-muted-foreground">
              No hay paradas para mostrar.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
