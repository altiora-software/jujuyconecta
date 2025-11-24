import { useState } from "react";
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

  const [activeTab, setActiveTab] = useState<"lines" | "map" | "reports">(
    "lines",
  );

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLine, setDetailsLine] = useState<TransportLine | null>(null);

  const openDetails = (line: TransportLine) => {
    setDetailsLine(line);
    setDetailsOpen(true);
  };

  const handleSeeOnMap = (lineId: string) => {
    setSelectedLineId(lineId);
    setActiveTab("map");
    setDetailsOpen(false);
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
            onValueChange={(v) => setActiveTab(v as any)}
            className="space-y-6"
          >
            <TabsList className="flex w-full flex-wrap gap-2 bg-muted/30 p-1 rounded-2xl">
              <TabsTrigger
                value="lines"
                className="text-xs md:text-sm px-3 py-1.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Líneas y empresas
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="text-xs md:text-sm px-3 py-1.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Mapa interactivo
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="text-xs md:text-sm px-3 py-1.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
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
                setSelectedCompanyName={setSelectedCompanyName}
                setSelectedLineId={setSelectedLineId}
                setActiveTab={setActiveTab}
                openDetails={openDetails}
              />
            </TabsContent>

            <TabsContent value="map">
              <MapTab
                lines={lines}
                stops={stops}
                selectedLineId={selectedLineId}
                setSelectedLineId={setSelectedLineId}
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
