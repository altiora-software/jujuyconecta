"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TransportHero } from "@/components/transport/TransportHero";
import { TransportLoadingSkeleton } from "@/components/transport/TransportLoadingSkeleton";
import { useTransportData } from "@/components/transport/useTransportData";
import { LinesTab } from "@/components/transport/LinesTab";
import { MapTab } from "@/components/transport/MapTab";
import { ReportsTab } from "@/components/transport/ReportsTab";
import { LineDetailsDialog } from "@/components/transport/LineDetailsDialog";
import { TransportLine } from "@/components/transport/types";

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

export default function TransportPage() {
  const {
    loading,
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
  } = useTransportData();

  const [activeTab, setActiveTab] =
    useState<"lines" | "map" | "reports">("lines");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLine, setDetailsLine] = useState<TransportLine | null>(null);

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
      company: line.company_name,
      has_reports: reports.some((r) => r.line_id === line.id),
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
    });
  };

  // -----------------------------
  // Tab change
  // -----------------------------
  const handleTabChange = (v: string) => {
    setActiveTab(v as any);

    trackGAEvent("transport_tab_change", {
      tab: v,
    });
  };

  // -----------------------------
  // Company filter
  // -----------------------------
  const handleCompanyFilterChange = (company: string | null) => {
    setSelectedCompanyName(company);

    trackGAEvent("transport_filter_company", {
      company: company || "all",
    });
  };

  // -----------------------------
  // Select from map
  // -----------------------------
  const handleSelectLineFromMap = (lineId: string) => {
    setSelectedLineId(lineId);

    trackGAEvent("transport_select_from_map", {
      line_id: lineId,
    });
  };

  if (loading) {
    return <TransportLoadingSkeleton />;
  }

  return (
    <Layout>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-sky-500/12 via-background to-background" />

        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
          <TransportHero
            linesCount={lines.length}
            companyCount={companyNames.length}
            totalStops={totalStops}
            reportsCount={reports.length}
            linesWithReports={linesWithReports}
          />

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
                lines={lines}
                filteredLines={filteredLines}
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
              />
            </TabsContent>

            <TabsContent value="map">
              <MapTab
                lines={lines}
                stops={stops}
                selectedLineId={selectedLineId}
                setSelectedLineId={handleSelectLineFromMap}
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
