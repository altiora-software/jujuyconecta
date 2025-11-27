import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supa = createClient(
  process.env.SUPA_URL as string,
  process.env.SUPA_SERVICE_ROLE_KEY as string
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [lines, social, jobs, alerts] = await Promise.all([
      // asumo que transport_lines tiene estas columnas y campo active
      supa
        .from("transport_lines")
        .select("id,name,number,color,active")
        .eq("active", true),

      // social_resources: uses type, address, verified, active
      supa
        .from("social_resources")
        .select("id,name,type,address,verified,active")
        .eq("active", true),

      // jobs_listings: usa company_name, city/municipality, is_featured, published_at, status
      supa
        .from("jobs_listings")
        .select("id,title,company_name,city,municipality,is_featured,published_at,status")
        .eq("status", "published")
        .order("is_featured", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(20),

      // security_alerts: category, severity, active, featured, created_at
      supa
        .from("security_alerts")
        .select("id,title,category,severity,active,featured,created_at")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    if (lines.error || social.error || jobs.error || alerts.error) {
      console.error("Supabase error", {
        lines: lines.error,
        social: social.error,
        jobs: jobs.error,
        alerts: alerts.error,
      });
      return res.status(500).json({ error: "Error fetching home data" });
    }

    return res.status(200).json({
      lines: lines.data ?? [],
      social: social.data ?? [],
      jobs: jobs.data ?? [],
      alerts: alerts.data ?? [],
    });
  } catch (err) {
    console.error("api/home error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
