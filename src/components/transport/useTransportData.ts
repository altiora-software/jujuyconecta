"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  TransportLine,
  TransportStop,
  TransportRawStop,
  TransportReport,
  IntercityRouteUI,
  IntercityCompany,
  IntercityRoute,
} from "@/components/transport/types";

export function useTransportData() {
  // ------------------------------------
  // ESTADOS
  // ------------------------------------
  const [loading, setLoading] = useState(true);

  // URBANO
  const [lines, setLines] = useState<TransportLine[]>([]);
  const [stops, setStops] = useState<TransportStop[]>([]);
  const [rawStops, setRawStops] = useState<TransportRawStop[]>([]);
  const [reports, setReports] = useState<TransportReport[]>([]);
  const [companyNames, setCompanyNames] = useState<string[]>([]);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string | null>(
    null
  );
  const [selectedLineId, setSelectedLineId] = useState<string | undefined>();

  // PROVINCIAL
  const [intercityCompanies, setIntercityCompanies] = useState<
    IntercityCompany[]
  >([]);
  const [intercityRoutes, setIntercityRoutes] = useState<IntercityRouteUI[]>(
    []
  );
  const [intercitySchedulesCount, setIntercitySchedulesCount] = useState(0);

  // ------------------------------------
  // FETCH URBANO
  // ------------------------------------
  const loadUrbanData = async () => {
    const [
      { data: linesData, error: linesError },
      { data: stopsData, error: stopsError },
      { data: rawStopsData, error: rawStopsError },
      { data: reportData, error: reportsError },
    ] = await Promise.all([
      supabase.from("transport_lines").select("*").order("number"),
      supabase.from("transport_stops").select("*"),
      supabase.from("transport_raw_stops").select("*"),
      supabase.from("transport_reports").select("*"),
    ]);

    if (linesError) console.error("Error cargando líneas urbanas", linesError);
    if (stopsError) console.error("Error cargando paradas", stopsError);
    if (rawStopsError)
      console.error("Error cargando raw_stops", rawStopsError);
    if (reportsError) console.error("Error cargando reportes", reportsError);

    const normalizedLines: TransportLine[] = (linesData || []).map(
      (l: any) => ({
        ...l,
        company_name: l.name,
      })
    );

    setLines(normalizedLines);
    setStops((stopsData || []) as TransportStop[]);
    setRawStops((rawStopsData || []) as TransportRawStop[]);
    setReports((reportData || []) as TransportReport[]);

    const companies = Array.from(
      new Set(normalizedLines.map((l) => l.name))
    ).sort();
    setCompanyNames(companies);
  };

  // ------------------------------------
  // FETCH PROVINCIAL
  // ------------------------------------
  const fetchIntercityCompanies = async () => {
    const { data, error } = await supabase
      .from("transport_companies")
      .select("id, name")

    if (error) {
      console.error("Error cargando empresas interurbanas", error);
      return [] as IntercityCompany[];
    }
    return data as IntercityCompany[];
  };

  const fetchIntercityRoutes = async () => {
    const { data, error } = await supabase
      .from("transport_intercity_routes")
      .select("*")
      .order("company_id");

    if (error) {
      console.error("Error cargando rutas interurbanas", error);
      return [] as IntercityRoute[];
    }
    return data as IntercityRoute[];
  };

  const fetchIntercitySchedules = async () => {
    const { data, error } = await supabase
      .from("transport_intercity_schedules")
      .select("*")
      .order("departure_time", { ascending: true });

    if (error) {
      console.error("Error cargando horarios interurbanos", error);
      return [] as any[];
    }
    return data as any[];
  };

  const loadIntercityData = async () => {
    const [companies, routes, schedules] = await Promise.all([
      fetchIntercityCompanies(),
      fetchIntercityRoutes(),
      fetchIntercitySchedules(),
    ]);

    const schedulesByRoute: Record<
      string,
      { weekday: string[]; weekend: string[] }
    > = {};

    schedules.forEach((s: any) => {
      if (!schedulesByRoute[s.route_id]) {
        schedulesByRoute[s.route_id] = { weekday: [], weekend: [] };
      }
      if (s.day_type === "weekdays") {
        schedulesByRoute[s.route_id].weekday.push(s.departure_time);
      } else {
        schedulesByRoute[s.route_id].weekend.push(s.departure_time);
      }
    });

    const finalRoutes: IntercityRouteUI[] = routes.map((r) => {
      const company = companies.find((c) => c.id === r.company_id);
      const group = schedulesByRoute[r.id] || {
        weekday: [],
        weekend: [],
      };

      return {
        id: r.id,
        company_name: company?.name || "Empresa",
        origin_city: r.origin_city,
        destination_city: r.destination_city,
        notes: r.notes,
        weekday_times: group.weekday,
        weekend_times: group.weekend,
      };
    });

    setIntercityCompanies(companies);
    setIntercityRoutes(finalRoutes);
    setIntercitySchedulesCount(schedules.length);
  };

  // ------------------------------------
  // LOAD ALL DATA (UN SOLO useEffect)
  // ------------------------------------
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadUrbanData(), loadIntercityData()]);
      setLoading(false);
    };

    loadAll();
  }, []);

  // ------------------------------------
  // DERIVADOS URBANO
  // ------------------------------------
  const filteredLines = useMemo(() => {
    if (!selectedCompanyName) return lines;
    return lines.filter((l) => l.name === selectedCompanyName);
  }, [lines, selectedCompanyName]);

  const totalStops = useMemo(() => rawStops.length, [rawStops]);

  const linesWithReports = useMemo(() => {
    const ids = new Set(reports.map((r) => r.line_id));
    return lines.filter((l) => ids.has(l.id)).length;
  }, [lines, reports]);

  // ------------------------------------
  // RETURN
  // ------------------------------------
  return {
    loading,

    // urbano
    lines,
    stops,
    rawStops,
    reports,
    companyNames,
    filteredLines,
    selectedCompanyName,
    setSelectedCompanyName,
    selectedLineId,
    setSelectedLineId,
    totalStops,
    linesWithReports,

    // provincial
    intercityCompanies,
    intercityRoutes,
    intercitySchedulesCount,
  };
}
