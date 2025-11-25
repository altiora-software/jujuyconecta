// src/hooks/useJobsListings.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JobListing } from "@/components/types/jobs";
import { useToast } from "@/hooks/use-toast";

interface UseJobsListingsParams {
  onlyPublished?: boolean;
}

export function useJobsListings({ onlyPublished = true }: UseJobsListingsParams = {}) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from("jobs_listings")
          .select("*")
          .order("is_featured", { ascending: false })
          .order("published_at", { ascending: false });

        if (onlyPublished) {
          query = query.eq("status", "published");
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error cargando jobs_listings", error);
          setError("No se pudieron cargar las ofertas laborales.");
          toast({
            title: "Error al cargar empleos",
            description: "No se pudieron cargar las ofertas laborales. Probá de nuevo en unos minutos.",
            variant: "destructive",
          });
          return;
        }

        setJobs((data || []) as JobListing[]);
      } catch (err) {
        console.error("Error inesperado en useJobsListings", err);
        setError("Ocurrió un error inesperado al cargar las ofertas.");
        toast({
          title: "Error inesperado",
          description: "Ocurrió un problema cargando los datos de empleos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [onlyPublished, toast]);

  return { jobs, loading, error };
}
