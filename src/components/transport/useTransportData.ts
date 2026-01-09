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
  const [stopsLoading, setStopsLoading] = useState(false); // Nuevo estado para feedback

  // URBANO
  const [lines, setLines] = useState<TransportLine[]>([]);
  const [stops, setStops] = useState<TransportStop[]>([]);
  const [rawStops, setRawStops] = useState<TransportRawStop[]>([]);
  const [reports, setReports] = useState<TransportReport[]>([]);
  const [companyNames, setCompanyNames] = useState<string[]>([]);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | undefined>();

  // PROVINCIAL
  const [intercityCompanies, setIntercityCompanies] = useState<IntercityCompany[]>([]);
  const [intercityRoutes, setIntercityRoutes] = useState<IntercityRouteUI[]>([]);
  const [intercitySchedulesCount, setIntercitySchedulesCount] = useState(0);

  // ------------------------------------
  // FETCH URBANO (Optimizado)
  // ------------------------------------
  const loadUrbanData = async () => {
    try {
      // Ya NO cargamos todas las paradas aquí. Solo líneas y reportes (datos ligeros).
      const [
        { data: linesData, error: linesError },
        { data: reportData, error: reportsError },
      ] = await Promise.all([
        supabase.from("transport_lines").select("*").order("number"),
        supabase.from("transport_reports").select("*"),
      ]);

      if (linesError) throw linesError;
      if (reportsError) throw reportsError;

      const normalizedLines: TransportLine[] = (linesData || []).map((l: any) => ({
        ...l,
        company_name: l.name,
      }));

      setLines(normalizedLines);
      setReports((reportData || []) as TransportReport[]);

      const companies = Array.from(
        new Set(normalizedLines.map((l) => l.name))
      ).sort();
      setCompanyNames(companies);
    } catch (e) {
      console.error("Error cargando líneas urbanas", e);
    }
  };

  // ------------------------------------
  // FETCH DE PARADAS BAJO DEMANDA (La clave de la eficiencia)
  // ------------------------------------
  useEffect(() => {
    // Si no hay línea seleccionada, vaciamos paradas para liberar memoria
    if (!selectedLineId) {
      setRawStops([]);
      setStops([]);
      return;
    }

    const fetchStopsForLine = async () => {
      setStopsLoading(true);
      try {
        // Traemos paradas filtradas por base de datos, no por JS
        const [
          { data: stopsData, error: stopsError },
          { data: rawStopsData, error: rawStopsError }
        ] = await Promise.all([
          supabase.from("transport_stops").select("*").eq("line_id", selectedLineId),
          supabase.from("transport_raw_stops").select("*").eq("line_id", selectedLineId)
        ]);

        if (stopsError) throw stopsError;
        if (rawStopsError) throw rawStopsError;

        setStops(stopsData || []);
        setRawStops(rawStopsData || []);
      } catch (e) {
        console.error("Error cargando paradas de la línea seleccionada", e);
      } finally {
        setStopsLoading(false);
      }
    };

    fetchStopsForLine();
  }, [selectedLineId]);

  // ------------------------------------
  // FETCH PROVINCIAL (Se mantiene íntegro)
  // ------------------------------------
  const fetchIntercityCompanies = async () => {
    const { data, error } = await supabase.from("transport_companies").select("id, name");
    if (error) return [];
    return data as IntercityCompany[];
  };

  const fetchIntercityRoutes = async () => {
    const { data, error } = await supabase.from("transport_intercity_routes").select("*").order("company_id");
    if (error) return [];
    return data as IntercityRoute[];
  };

  const fetchIntercitySchedules = async () => {
    const { data, error } = await supabase.from("transport_intercity_schedules").select("*").order("departure_time", { ascending: true });
    if (error) return [];
    return data as any[];
  };

  const loadIntercityData = async () => {
    const [companies, routes, schedules] = await Promise.all([
      fetchIntercityCompanies(),
      fetchIntercityRoutes(),
      fetchIntercitySchedules(),
    ]);

    const schedulesByRoute: Record<string, { weekday: string[]; weekend: string[] }> = {};

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
      const group = schedulesByRoute[r.id] || { weekday: [], weekend: [] };

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
  // LOAD ALL DATA (Carga Inicial)
  // ------------------------------------
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([loadUrbanData(), loadIntercityData()]);
      } catch (e) {
        console.error("Error cargando datos de transporte", e);
      } finally {
        setLoading(false);
      }
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
    stopsLoading, // Devuelto para mostrar spinners en MapTab o Dialogs

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