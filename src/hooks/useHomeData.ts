import { useEffect, useState } from "react";

export interface HomeData {
    lines: Array<{
      id: string;
      name: string;
      number: string;
      color: string;
      active: boolean;
    }>;
    social: Array<{
      id: string;
      name: string;
      category: string;
      city: string;
      active: boolean;
    }>;
    jobs: Array<{
      id: string;
      title: string;
      company: string;
      location: string;
      is_featured: boolean;
      published_at: string;
    }>;
    alerts: Array<{
      id: string;
      title: string;
      category: string;
      city: string;
      is_active: boolean;
      created_at: string;
    }>;
  }
  
  export function useHomeData() {
    const [data, setData] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      let cancelled = false;
  
      async function load() {
        try {
          setLoading(true);
          const res = await fetch("/api/home");
          if (!res.ok) throw new Error("Error loading home data");
          const json = (await res.json()) as HomeData;
          if (!cancelled) {
            setData(json);
            setError(null);
          }
        } catch (err: any) {
          if (!cancelled) {
            console.error("useHomeData error::", err);
            setError(err.message ?? "Unknown error");
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
  
      load();
      return () => {
        cancelled = true;
      };
    }, []);
  
    return { data, loading, error };
  }
  