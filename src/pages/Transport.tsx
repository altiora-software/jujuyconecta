"use client";

import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { TransportHero } from "@/components/transport/TransportHero";
import { TransportLoadingSkeleton } from "@/components/transport/TransportLoadingSkeleton";
import { useTransportData } from "@/components/transport/useTransportData";
import { LinesTab } from "@/components/transport/LinesTab";
import { MapTab } from "@/components/transport/MapTab";
import { ReportsTab } from "@/components/transport/ReportsTab";
import { LineDetailsDialog } from "@/components/transport/LineDetailsDialog";
import { TransportLine } from "@/components/transport/types";

import { Search, X } from "lucide-react";

// Vista actual del módulo de transporte
type TransportViewMode = "urban" | "intercity";

// -----------------------------
// GA HELPER
// -----------------------------
function trackGAEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  const gtag = (window as any).gtag;
  if (!gtag) return;
  gtag("event", eventName, {
    section: "transport",
    page: "/transporte",
    ...params,
  });
}

// -----------------------------
// SEARCH HELPERS
// -----------------------------
function normalizeText(v: unknown) {
  return String(v ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .trim();
}

function pickStrings(obj: any, preferredKeys: string[]) {
  const out: string[] = [];

  // 1) claves preferidas (si existen)
  for (const k of preferredKeys) {
    const val = obj?.[k];
    if (typeof val === "string" || typeof val === "number") out.push(String(val));
    if (Array.isArray(val)) out.push(val.join(" "));
  }

  // 2) fallback: recorremos valores primitivos (sin volarnos con JSON entero)
  if (obj && typeof obj === "object") {
    for (const [k, val] of Object.entries(obj)) {
      if (preferredKeys.includes(k)) continue;
      if (typeof val === "string" || typeof val === "number") out.push(String(val));
      if (Array.isArray(val) && val.every((x) => typeof x === "string" || typeof x === "number")) {
        out.push(val.join(" "));
      }
      if (out.length > 30) break; // corte para performance
    }
  }

  return out.join(" ");
}

export default function TransportPage() {
  const {
    loading,

    // URBANO
    lines,
    stops,
    rawStops,
    reports,
    selectedLineId,
    setSelectedLineId,
    selectedCompanyName,
    setSelectedCompanyName,
    companyNames,
    filteredLines,
    totalStops,
    linesWithReports,

    // PROVINCIAL
    intercityCompanies,
    intercityRoutes,
    intercitySchedulesCount,
  } = useTransportData();

  const [activeTab, setActiveTab] =
    useState<"lines" | "map" | "reports">("lines");

  const [viewMode, setViewMode] = useState<TransportViewMode>("urban");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLine, setDetailsLine] = useState<TransportLine | null>(null);
  
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  // -----------------------------
  // Search state
  // -----------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const q = useMemo(() => normalizeText(searchQuery), [searchQuery]);
  const hasQuery = q.length >= 2; // evita filtrar por 1 letra y matar performance

  // -----------------------------
  // Page view
  // -----------------------------
  useEffect(() => {
    trackGAEvent("transport_page_view", {
      location: typeof window !== "undefined" ? window.location.href : "",
    });
  }, []);

  // -----------------------------
  // Open details
  // -----------------------------
  const openDetails = (line: TransportLine) => {
    setDetailsLine(line);
    setDetailsOpen(true);

    trackGAEvent("transport_line_details_open", {
      line_id: line.id,
      line_name: line.name,
      company: (line as any).company_name,
      has_reports: reports.some((r) => r.line_id === line.id),
      view_mode: viewMode,
    });
  };

  // -----------------------------
  // See on map from dialog
  // -----------------------------
  const handleSeeOnMap = (lineId: string) => {
    setSelectedLineId(lineId);
    setActiveTab("map");
    setDetailsOpen(false);

    trackGAEvent("transport_line_see_on_map", {
      line_id: lineId,
      view_mode: viewMode,
    });
  };

  // -----------------------------
  // Select line from list
  // -----------------------------
  const handleSelectLineFromList = (lineId: string, source: string) => {
    setSelectedLineId(lineId);

    trackGAEvent("transport_select_line", {
      line_id: lineId,
      source, // "list" | "company_filter" | "details"
      view_mode: viewMode,
    });
  };

  // -----------------------------
  // Tab change
  // -----------------------------
  const handleTabChange = (v: string) => {
    setActiveTab(v as any);

    trackGAEvent("transport_tab_change", {
      tab: v,
      view_mode: viewMode,
    });
  };

  // -----------------------------
  // Company filter
  // -----------------------------
  const handleCompanyFilterChange = (company: string | null) => {
    setSelectedCompanyName(company || null);

    trackGAEvent("transport_filter_company", {
      company: company || "all",
      view_mode: viewMode,
    });
  };

  // -----------------------------
  // Select from map
  // -----------------------------
  const handleSelectLineFromMap = (lineId: string) => {
    setSelectedLineId(lineId);

    trackGAEvent("transport_select_from_map", {
      line_id: lineId,
      view_mode: viewMode,
    });
  };

  // -----------------------------
  // View mode change (urbano / interurbano)
  // -----------------------------
  const handleViewModeChange = (mode: TransportViewMode) => {
    if (mode === viewMode) return;

    setViewMode(mode);

    // reset de selección al cambiar de universo
    setSelectedLineId(undefined);
    setSelectedCompanyName(null);
    setActiveTab("lines");
    setSearchQuery("");

    trackGAEvent("transport_view_mode_change", {
      view_mode: mode,
    });
  };

  // -----------------------------
  // Build search indexes (memoized)
  // -----------------------------
  const lineSearchIndex = useMemo(() => {
    // index sobre líneas (urbano)
    const preferred = ["id", "name", "company_name", "company", "empresa", "linea", "line", "route", "notes"];
    const map = new Map<string, string>();
    for (const l of lines) {
      map.set(String((l as any).id), normalizeText(pickStrings(l, preferred)));
    }
    return map;
  }, [lines]);

  const stopLineIdHits = useMemo(() => {
    // si matchea texto en una parada, levantamos el line_id asociado
    if (!hasQuery) return new Set<string>();

    const preferredStopKeys = [
      "name",
      "stop_name",
      "title",
      "address",
      "street",
      "calle",
      "neighborhood",
      "barrio",
      "zone",
      "zona",
      "reference",
      "referencia",
      "company_name",
      "empresa",
      "line_name",
      "linea",
    ];

    const hits = new Set<string>();
    for (const s of rawStops as any[]) {
      const blob = normalizeText(pickStrings(s, preferredStopKeys));
      if (!blob) continue;
      if (blob.includes(q)) {
        const lid =
          s?.line_id ??
          s?.lineId ??
          s?.route_id ??
          s?.routeId ??
          s?.line ??
          s?.linea;
        if (lid) hits.add(String(lid));
      }
    }
    
    return hits;
  }, [rawStops, hasQuery, q]);

  const filteredLinesSearched = useMemo(() => {
    // aplicamos búsqueda sobre el set YA filtrado por empresa (filteredLines viene del hook)
    if (!hasQuery) return filteredLines;

    const out: TransportLine[] = [];
    for (const l of filteredLines) {
      const id = String((l as any).id);
      const hayPorStop = stopLineIdHits.has(id);

      const hayPorLinea = (lineSearchIndex.get(id) || "").includes(q);
      if (hayPorStop || hayPorLinea) out.push(l);
    }
    return out;
  }, [filteredLines, hasQuery, q, stopLineIdHits, lineSearchIndex]);

  const intercityRoutesSearched = useMemo(() => {
    if (!hasQuery) return intercityRoutes;

    const preferred = [
      "company_name",
      "empresa",
      "name",
      "route",
      "origen",
      "destino",
      "from",
      "to",
      "terminal",
      "paradas",
      "stops",
      "notes",
      "frequency",
      "horarios",
    ];

    return intercityRoutes.filter((r: any) => {
      const blob = normalizeText(pickStrings(r, preferred));
      return blob.includes(q);
    });
  }, [intercityRoutes, hasQuery, q]);

  // -----------------------------
  // GA: search tracking (debounced)
  // -----------------------------
  useEffect(() => {
    console.log('rawStops',rawStops);
    if (!hasQuery) return;

    const t = window.setTimeout(() => {
      const resultsCount =
        viewMode === "urban"
          ? filteredLinesSearched.length
          : intercityRoutesSearched.length;

      trackGAEvent("transport_search", {
        q: searchQuery,
        q_len: searchQuery.trim().length,
        view_mode: viewMode,
        results: resultsCount,
      });
    }, 450);

    return () => window.clearTimeout(t);
  }, [hasQuery, searchQuery, viewMode, filteredLinesSearched.length, intercityRoutesSearched.length]);

  if (loading) {
    return <TransportLoadingSkeleton />;
  }

  // métricas provinciales
  const intercityCompanyCount = new Set(
    intercityRoutes.map((r: any) => r.company_name)
  ).size;

  // counts visibles (para que el usuario sienta el filtro)
  const visibleLinesCount =
    viewMode === "urban" ? filteredLinesSearched.length : intercityRoutesSearched.length;

  return (
    <Layout>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-sky-500/12 via-background to-background" />

        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
          <TransportHero
            // urbano
            linesCount={lines.length}
            companyCount={companyNames.length}
            totalStops={totalStops}
            reportsCount={reports.length}
            linesWithReports={linesWithReports}
            // provincial
            intercityRouteCount={intercityRoutes.length}
            intercityCompanyCount={intercityCompanyCount}
            intercitySchedulesCount={intercitySchedulesCount}
            // modo
            viewMode={viewMode}
            onModeChange={handleViewModeChange}
          />

          {/* BUSCADOR GLOBAL */}
          <Card className="rounded-2xl border bg-background/70 backdrop-blur">
            <CardContent className="p-4 md:p-5">
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscá por línea, empresa, barrio, calle, terminal, origen/destino..."
                    className="pl-9 pr-10 h-11 rounded-xl"
                  />
                  {searchQuery.trim().length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg"
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                  {hasQuery ? (
                    <span>
                      Resultados: <span className="font-medium text-foreground">{visibleLinesCount}</span>
                    </span>
                  ) : (
                    <span>Tip: escribí 2+ letras</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-6"
          >
            <TabsList className="flex w-full flex-wrap gap-2 bg-muted/30 p-1 rounded-2xl">
              <TabsTrigger
                value="lines"
                className="text-xs md:text-sm px-3 py-1.5 rounded-xl
                data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Líneas y empresas
              </TabsTrigger>

              <TabsTrigger
                value="map"
                className="text-xs md:text-sm px-3 py-1.5 rounded-xl 
                data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Mapa interactivo
              </TabsTrigger>

              <TabsTrigger
                value="reports"
                className="text-xs md:text-sm px-3 py-1.5 rounded-xl 
                data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Reportes en circulación
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lines">
              <LinesTab
                // urbano
                lines={lines}
                filteredLines={filteredLinesSearched} // <- ACÁ APLICAMOS BUSCADOR
                stops={stops}
                rawStops={rawStops}
                reports={reports}
                companyNames={companyNames}
                selectedCompanyName={selectedCompanyName}
                setSelectedCompanyName={handleCompanyFilterChange}
                setSelectedLineId={(id: string) =>
                  handleSelectLineFromList(id, "list")
                }
                setActiveTab={setActiveTab}
                openDetails={openDetails}
                // provincial
                viewMode={viewMode}
                intercityRoutes={intercityRoutesSearched} // <- Y ACÁ PARA INTERURBANO
              />
            </TabsContent>

            <TabsContent value="map" forceMount>
            <MapTab
              lines={lines}
              stops={stops}
              rawStops={rawStops}
              selectedLineId={selectedLineId}
              setSelectedLineId={handleSelectLineFromMap}
              selectedStopId={selectedStopId}
              setSelectedStopId={setSelectedStopId}
              viewMode={viewMode}
            />
          </TabsContent>

            <TabsContent value="reports">
              <ReportsTab reports={reports} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <LineDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        detailsLine={detailsLine}
        rawStops={rawStops}
        reports={reports}
        onSeeOnMap={handleSeeOnMap}
      />
    </Layout>
  );
}
