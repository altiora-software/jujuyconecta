import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  TransportLine,
  TransportStop,
  TransportRawStop,
  TransportReport,
} from "./types";

export function useTransportData() {
  const [lines, setLines] = useState<TransportLine[]>([]);
  const [stops, setStops] = useState<TransportStop[]>([]);
  const [rawStops, setRawStops] = useState<TransportRawStop[]>([]);
  const [reports, setReports] = useState<TransportReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedLineId, setSelectedLineId] = useState<string>();
  const [selectedCompanyName, setSelectedCompanyName] = useState<
    string | undefined
  >();

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [linesRes, rawStopsRes, reportsRes] = await Promise.all([
        supabase
          .from("transport_lines")
          .select("*")
          .eq("active", true)
          .order("number"),
        supabase
          .from("transport_raw_stops")
          .select(
            "id,line_id,direction,order_index,stop_name,direccion,latitude,longitude",
          )
          .order("order_index"),
        supabase
          .from("transport_reports")
          .select(`*, transport_lines (*)`)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (linesRes.error) throw linesRes.error;
      if (rawStopsRes.error) throw rawStopsRes.error;
      if (reportsRes.error) throw reportsRes.error;

      const linesMapped: TransportLine[] = (linesRes.data || []).map(
        (l: any) => ({
          id: l.id,
          name: l.name,
          number: l.number,
          color: l.color,
          route_description: l.route_description,
          active: l.active,
        }),
      );

      const rawStopsData = (rawStopsRes.data || []) as any[];

      const stopsMapped: TransportStop[] = rawStopsData
        .filter((s) => s.latitude && s.longitude)
        .map((s) => ({
          id: s.id as string,
          line_id: s.line_id as string,
          name: s.stop_name as string,
          latitude: Number(s.latitude),
          longitude: Number(s.longitude),
          order_index: s.order_index as number,
        }));

      const rawStopsMapped: TransportRawStop[] = rawStopsData.map((s) => ({
        id: s.id as string,
        line_id: s.line_id as string,
        direction: s.direction as string,
        order_index: s.order_index as number,
        stop_name: s.stop_name as string,
        direccion: s.direccion as string | null,
        latitude: s.latitude as string | null,
        longitude: s.longitude as string | null,
      }));

      const reportsMapped = (reportsRes.data || []) as TransportReport[];

      setLines(linesMapped);
      setStops(stopsMapped);
      setRawStops(rawStopsMapped);
      setReports(reportsMapped);

      if (!selectedLineId && linesMapped.length > 0) {
        const lineWithStops = linesMapped.find((line) =>
          stopsMapped.some((s) => s.line_id === line.id),
        );
        if (lineWithStops) {
          setSelectedLineId(lineWithStops.id);
        }
      }
    } catch (error: any) {
      console.error("Error fetching transport data:", error);
      toast({
        title: "Error",
        description:
          error?.message ||
          "No se pudo cargar la información de transporte.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedLineId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const companyNames = useMemo(() => {
    const setNames = new Set<string>();
    for (const l of lines) {
      if (l.name) setNames.add(l.name);
    }
    return Array.from(setNames).sort((a, b) => a.localeCompare(b));
  }, [lines]);

  const filteredLines = useMemo(() => {
    if (!selectedCompanyName) return lines;
    return lines.filter((l) => l.name === selectedCompanyName);
  }, [lines, selectedCompanyName]);

  const totalStops = rawStops.length;
  const linesWithReports = useMemo(
    () => new Set(reports.map((r) => r.line_id)).size,
    [reports],
  );

  return {
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
    refetch: fetchData,
  };
}
