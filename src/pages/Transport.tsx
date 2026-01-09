"use client";

import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { TransportHero } from "@/components/transport/TransportHero";
import { TransportLoadingSkeleton } from "@/components/transport/TransportLoadingSkeleton";
import { useTransportData } from "@/components/transport/useTransportData";
import { LinesTab } from "@/components/transport/LinesTab";
import { MapTab } from "@/components/transport/MapTab";
import { ReportsTab } from "@/components/transport/ReportsTab";
import { LineDetailsDialog } from "@/components/transport/LineDetailsDialog";
import { TransportLine } from "@/components/transport/types";

import { Search, X, Loader2, Bus, Map as MapIcon, AlertCircle } from "lucide-react";

type TransportViewMode = "urban" | "intercity";

function trackGAEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  const gtag = (window as any).gtag;
  if (!gtag) return;
  gtag("event", eventName, { section: "transport", page: "/transporte", ...params });
}

function normalizeText(v: unknown) {
  return String(v ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function pickStrings(obj: any, preferredKeys: string[]) {
  const out: string[] = [];
  for (const k of preferredKeys) {
    const val = obj?.[k];
    if (typeof val === "string" || typeof val === "number") out.push(String(val));
    if (Array.isArray(val)) out.push(val.join(" "));
  }
  if (obj && typeof obj === "object") {
    for (const [k, val] of Object.entries(obj)) {
      if (preferredKeys.includes(k)) continue;
      if (typeof val === "string" || typeof val === "number") out.push(String(val));
      if (Array.isArray(val) && val.every((x) => typeof x === "string" || typeof x === "number")) {
        out.push(val.join(" "));
      }
    }
  }
  return out.join(" ");
}

export default function TransportPage() {
  const {
    loading,
    stopsLoading,
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
    intercityRoutes,
    intercitySchedulesCount,
  } = useTransportData();

  const [activeTab, setActiveTab] = useState<"lines" | "map" | "reports">("lines");
  const [viewMode, setViewMode] = useState<TransportViewMode>("urban");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLine, setDetailsLine] = useState<TransportLine | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const q = useMemo(() => normalizeText(searchQuery), [searchQuery]);
  const hasQuery = q.length >= 2;

  useEffect(() => {
    trackGAEvent("transport_page_view", { location: window.location.href });
  }, []);

  const openDetails = (line: TransportLine) => {
    setDetailsLine(line);
    setSelectedLineId(line.id);
    setDetailsOpen(true);
    trackGAEvent("transport_line_details_open", { line_id: line.id, line_name: line.name });
  };

  const handleSeeOnMap = (lineId: string) => {
    setSelectedLineId(lineId);
    setActiveTab("map");
    setDetailsOpen(false);
  };

  const handleTabChange = (v: string) => {
    setActiveTab(v as any);
    trackGAEvent("transport_tab_change", { tab: v });
  };

  const lineSearchIndex = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of lines) {
      map.set(String((l as any).id), normalizeText(pickStrings(l, ["id", "name", "company_name"])));
    }
    return map;
  }, [lines]);

  const stopLineIdHits = useMemo(() => {
    if (!hasQuery) return new Set<string>();
    const hits = new Set<string>();
    for (const s of rawStops as any[]) {
      if (normalizeText(pickStrings(s, ["name", "address", "neighborhood"])).includes(q)) {
        const lid = s?.line_id || s?.lineId;
        if (lid) hits.add(String(lid));
      }
    }
    return hits;
  }, [rawStops, hasQuery, q]);

  const filteredLinesSearched = useMemo(() => {
    if (!hasQuery) return filteredLines;
    return filteredLines.filter((l) => {
      const id = String((l as any).id);
      return stopLineIdHits.has(id) || (lineSearchIndex.get(id) || "").includes(q);
    });
  }, [filteredLines, hasQuery, q, stopLineIdHits, lineSearchIndex]);

  const intercityRoutesSearched = useMemo(() => {
    if (!hasQuery) return intercityRoutes;
    return intercityRoutes.filter((r: any) => normalizeText(pickStrings(r, ["company_name", "origin_city", "destination_city"])).includes(q));
  }, [intercityRoutes, hasQuery, q]);

  if (loading) return <TransportLoadingSkeleton />;

  return (
    <Layout>
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-sky-500/5 via-background to-background" />
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-10">
          <TransportHero
            linesCount={lines.length}
            companyCount={companyNames.length}
            totalStops={totalStops}
            reportsCount={reports.length}
            linesWithReports={linesWithReports}
            intercityRouteCount={intercityRoutes.length}
            intercitySchedulesCount={intercitySchedulesCount}
            viewMode={viewMode}
            onModeChange={(mode) => {
              setViewMode(mode as any);
              setSelectedLineId(undefined);
              setSearchQuery("");
            }}
          />

          <div className="max-w-4xl mx-auto w-full">
            <Card className="rounded-[2.5rem] border-none bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-xl">
              <CardContent className="p-2 flex items-center">
                <Search className="ml-6 h-6 w-6 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscá línea, barrio o empresa..."
                  className="h-16 border-none bg-transparent text-lg focus-visible:ring-0 placeholder:text-slate-400 font-medium"
                />
                {searchQuery && <Button variant="ghost" onClick={() => setSearchQuery("")} className="mr-2 rounded-full h-10 w-10 p-0"><X className="h-5 w-5" /></Button>}
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-10">
            <div className="flex justify-center sticky top-20 z-40">
              <TabsList className="relative flex h-16 w-full max-w-2xl items-center justify-between rounded-full border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-2 backdrop-blur-xl shadow-2xl">
                {[
                  { id: "lines", label: "Líneas", icon: Bus },
                  { id: "map", label: "Mapa", icon: MapIcon },
                  { id: "reports", label: "Reportes", icon: AlertCircle },
                ].map((t) => (
                  <TabsTrigger
                    key={t.id}
                    value={t.id}
                    className="relative z-10 flex h-full flex-1 items-center justify-center gap-2 rounded-full text-xs font-bold transition-all data-[state=active]:text-white data-[state=inactive]:text-slate-500"
                  >
                    <t.icon className="h-4 w-4" />
                    <span>{t.label}</span>
                    {activeTab === t.id && <div className="absolute inset-0 z-[-1] rounded-full bg-primary shadow-lg shadow-primary/30 animate-in zoom-in-95 duration-300" />}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="lines" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <LinesTab
                lines={lines}
                filteredLines={filteredLinesSearched}
                stops={stops}
                rawStops={rawStops}
                reports={reports}
                companyNames={companyNames}
                selectedCompanyName={selectedCompanyName}
                setSelectedCompanyName={(c) => setSelectedCompanyName(c)}
                setSelectedLineId={(id) => { setSelectedLineId(id); trackGAEvent("transport_select_line", { line_id: id }); }}
                setActiveTab={setActiveTab}
                openDetails={openDetails}
                viewMode={viewMode}
                intercityRoutes={intercityRoutesSearched}
              />
            </TabsContent>

            <TabsContent value="map" forceMount className={`${activeTab !== "map" ? "hidden" : ""} relative h-[650px] rounded-[3rem] overflow-hidden border-8 border-white dark:border-slate-900 shadow-2xl outline-none`}>
              {stopsLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="font-black italic text-slate-800 dark:text-white uppercase tracking-tight">Sincronizando paradas...</span>
                  </div>
                </div>
              )}
              <MapTab
                lines={lines}
                stops={stops}
                rawStops={rawStops}
                selectedLineId={selectedLineId}
                setSelectedLineId={(id) => setSelectedLineId(id)}
                selectedStopId={selectedStopId}
                setSelectedStopId={setSelectedStopId}
                viewMode={viewMode}
              />
            </TabsContent>

            <TabsContent value="reports" className="outline-none animate-in fade-in duration-500">
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