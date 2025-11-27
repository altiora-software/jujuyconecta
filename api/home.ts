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
      supa.from("transport_lines").select("id,name,number,color,active").eq("active", true),
      supa.from("social_resources").select("id,name,category,city,active").eq("active", true),
      supa.from("jobs_listings")
        .select("id,title,company,location,is_featured,published_at")
        .order("published_at", { ascending: false })
        .limit(20),
      supa.from("security_alerts")
        .select("id,title,category,city,is_active,created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(30)
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
